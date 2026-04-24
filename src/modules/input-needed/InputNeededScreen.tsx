import { formatLoadError } from "@/lib/utils/error-message";
import { getInputNeededItems } from "./api/get-items";
import { InputNeededView } from "./InputNeededView";

export async function InputNeededScreen() {
  const result = await getInputNeededItems()
    .then((items) => ({ ok: true as const, items }))
    .catch((error: unknown) => ({ ok: false as const, error }));
  if (!result.ok) {
    return <InputNeededView loadError={formatLoadError(result.error)} />;
  }
  return <InputNeededView items={result.items} />;
}
