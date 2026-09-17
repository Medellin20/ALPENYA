const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');

function find(node, predicate) {
  if (!node || typeof node !== 'object') return;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const result = find(child, predicate);
    if (result) return result;
  }
}

function harness() {
  const states = [], refs = [], pending = [], uploads = [], errors = [];
  let stateIndex, refIndex;
  const component = () => null;
  const imports = {
    react: { ...React,
      useState(initial) {
        const index = stateIndex++;
        if (!(index in states)) states[index] = initial;
        return [states[index], next => { states[index] = typeof next === 'function' ? next(states[index]) : next; }];
      },
      useRef(initial) { const index = refIndex++; return refs[index] ?? (refs[index] = { current: initial }); },
    },
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/image': component,
    sonner: { toast: { success() {}, error(message) { errors.push(message); } } },
    'lucide-react': new Proxy({}, { get: () => component }),
    '@/hooks/use-pending-action': { usePendingAction: () => [false, action => pending.push(action())] },
    '@/components/ui/button': { Button: component },
    '@/components/ui/modal': { Modal: component },
    '@/lib/utils/cn': { cn: () => '' },
    '@/actions/admin-images': {
      async uploadPropertyImages(id, data) {
        uploads.push(data.getAll('images'));
        await Promise.resolve();
        return { success: true, data: [{ id: `new-${uploads.length}`, url: '/new.jpg', sort_order: uploads.length + 1 }] };
      },
      async reorderPropertyImages() { return { success: true }; },
    },
  };
  const context = { exports: {}, FormData, require: name => {
    assert.ok(name in imports, `Unexpected import ${name}`);
    return imports[name];
  } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('components/admin/image-uploader.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, context);
  function render() {
    stateIndex = 0; refIndex = 0;
    return context.exports.ImageUploader({ propertyId: 'property', initialImages: [
      { id: 'a', url: '/a.jpg', sort_order: 0 }, { id: 'b', url: '/b.jpg', sort_order: 1 },
    ] });
  }
  return { render, states, pending, uploads, errors };
}
const photo = () => new Blob(['photo'], { type: 'image/jpeg' });

test('Adding photos preserves the order previously chosen by the admin and sends one file per request', async () => {
  const flow = harness();
  find(flow.render(), node => node.props?.title === 'Déplacer vers la droite').props.onClick();
  await Promise.all(flow.pending);
  const input = find(flow.render(), node => node.type === 'input');
  await input.props.onChange({ target: { files: [photo(), photo()] } });
  assert.deepEqual(Array.from(flow.states[0], image => image.id), ['b', 'a', 'new-1', 'new-2']);
  assert.equal(flow.uploads.length, 2);
  assert.ok(flow.uploads.every(files => files.length === 1));
});

test('Dropping a photo uploads it and blocks duplicate uploads until completion', async () => {
  const flow = harness();
  let prevented = false;
  const label = find(flow.render(), node => node.type === 'label');
  label.props.onDrop({ preventDefault() { prevented = true; }, dataTransfer: { files: [photo()] } });
  const input = find(flow.render(), node => node.type === 'input');
  assert.equal(input.props.disabled, true);
  await input.props.onChange({ target: { files: [photo()] } });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(prevented, true);
  assert.equal(flow.uploads.length, 1);
  assert.equal(find(flow.render(), node => node.type === 'input').props.disabled, false);
});

test('An invalid file is reported without preventing valid photos from uploading', async () => {
  const flow = harness();
  await find(flow.render(), node => node.type === 'input').props.onChange({ target: { files: [new Blob(['text'], { type: 'text/plain' }), photo()] } });
  assert.equal(flow.errors.length, 1);
  assert.equal(flow.uploads.length, 1);
});
