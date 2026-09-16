export function PropertyDataError({ message, retryHref }: { message: string; retryHref: string }) {
  return (
    <div role="alert" className="rounded-xl border border-brick-500/30 bg-brick-500/10 p-5 text-sm text-brick-500">
      <h2 className="font-semibold">Le formulaire est momentanément indisponible</h2>
      <p className="mt-2">{message}</p>
      <p className="mt-2">Aucune modification n’a été enregistrée.</p>
      <a href={retryHref} className="mt-4 inline-flex font-semibold underline">Réessayer</a>
    </div>
  );
}
