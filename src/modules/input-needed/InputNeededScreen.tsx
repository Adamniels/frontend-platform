import { getInputNeededItems } from "./api/get-items";
import { InputNeededView } from "./InputNeededView";

export async function InputNeededScreen() {
  let items: Awaited<ReturnType<typeof getInputNeededItems>> | undefined;
  let error: unknown;

  try {
    items = await getInputNeededItems();
  } catch (caught) {
    error = caught;
  }

  if (error !== undefined) {
    return <InputNeededView error={error} />;
  }
  if (items === undefined) {
    return <InputNeededView error={new Error("Missing items")} />;
  }
  return <InputNeededView items={items} />;
}
