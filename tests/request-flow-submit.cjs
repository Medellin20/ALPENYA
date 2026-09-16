const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');

function harness(file, exportName) {
  let step = 0;
  let sends = 0;
  const pending = [];
  const component = () => null;
  const action = async () => { sends++; return { success: true }; };
  const imports = {
    react: {
      ...React,
      useState: () => [step, setter => { step = typeof setter === 'function' ? setter(step) : setter; }],
      useTransition: () => [false, callback => pending.push(callback())],
    },
    'react/jsx-runtime': require('react/jsx-runtime'),
    'react-hook-form': { useForm: () => ({
      register: () => ({}), trigger: async () => true, watch: () => ({}),
      handleSubmit: callback => async () => callback({}), formState: { errors: {} },
    }) },
    '@hookform/resolvers/zod': { zodResolver: () => ({}) },
    'framer-motion': { AnimatePresence: component, motion: { div: component } },
    sonner: { toast: { error: () => {} } },
    'lucide-react': new Proxy({}, { get: () => component }),
    '@/lib/validations/viewing': { viewingRequestSchema: {} },
    '@/lib/validations/reservation': { reservationSchema: {} },
    '@/actions/viewings': { createViewingRequest: action },
    '@/actions/reservations': { createReservation: action },
    '@/components/ui/input': { Input: component },
    '@/components/ui/select': { Select: component },
    '@/components/ui/checkbox': { Checkbox: component },
    '@/components/ui/label': { Label: component, FieldError: component },
    '@/components/ui/button': { Button: component },
    '@/lib/utils/constants': { TIME_SLOTS: [] },
    '@/lib/utils/cn': { cn: () => '' },
    '@/components/forms/reservation-payment-notice': { ReservationPaymentNotice: component },
  };
  const context = { exports: {}, require: name => {
    assert.ok(name in imports, `Unexpected import: ${name}`);
    return imports[name];
  } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, context);
  const render = () => context.exports[exportName]({ propertyId: 'id', propertySlug: 'slug', propertyTitle: 'Logement' });
  return { render, pending, sends: () => sends };
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return;
  if (predicate(node)) return node;
  const children = node.props?.children;
  for (const child of (Array.isArray(children) ? children.flat(Infinity) : [children])) {
    const match = find(child, predicate);
    if (match) return match;
  }
}
for (const [file, name] of [
  ['viewing-request-form', 'ViewingRequestForm'],
  ['reservation-form', 'ReservationForm'],
]) {
  test(`${name}: arriving at the recap or submitting implicitly sends nothing; explicit click sends once`, async () => {
    const flow = harness(`components/forms/${file}.tsx`, name);
    let tree = flow.render();
    assert.equal(flow.sends(), 0);
    for (let step = 0; step < 2; step++) {
      const next = find(tree, node => node.key === 'continue');
      assert.equal(next.props.type, 'button');
      await next.props.onClick();
      tree = flow.render();
      assert.equal(flow.sends(), 0);
    }
    let prevented = false;
    find(tree, node => node.type === 'form').props.onSubmit({ preventDefault: () => { prevented = true; } });
    assert.equal(prevented, true);
    assert.equal(flow.sends(), 0);
    const send = find(tree, node => node.key === 'send-request');
    assert.equal(send.props.type, 'button');
    await send.props.onClick();
    await Promise.all(flow.pending);
    assert.equal(flow.sends(), 1);
  });
}
