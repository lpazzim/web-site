import { Link, type LinkProps } from "react-router";
import { useLocalizedPath } from "./useLocale";

type LocaleLinkProps = Omit<LinkProps, "to"> & { to: string };

/** <Link> for app paths ("/work"); keeps the visitor in their current language. */
export function LocaleLink({ to, ...props }: LocaleLinkProps) {
  const localize = useLocalizedPath();
  return <Link to={localize(to)} {...props} />;
}
