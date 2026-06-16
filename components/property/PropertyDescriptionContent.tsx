interface PropertyDescriptionContentProps {
  metaDescription?: string;
  description: string;
}

export function PropertyDescriptionContent({
  metaDescription,
  description,
}: PropertyDescriptionContentProps) {
  return (
    <div className="mt-4 space-y-4">
      {metaDescription ? (
        <p className="text-lg leading-8 text-zinc-700">{metaDescription}</p>
      ) : null}
      <div className="whitespace-pre-wrap leading-8 text-zinc-700">{description}</div>
    </div>
  );
}
