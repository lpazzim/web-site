import { Link, type LinkProps } from "react-router";
import { useLocalizedPath } from "./useLocale";

type LocaleLinkProps = Omit<LinkProps, "to"> & { to: string };

/**
 * <Link> for app paths ("/work"); keeps the visitor in their current language.
 * Navigations animate with the View Transitions API (see index.css); browsers
 * without it navigate instantly.
 */
export function LocaleLink({ to, viewTransition = true, ...props }: LocaleLinkProps) {
  const localize = useLocalizedPath();
  return <Link to={localize(to)} viewTransition={viewTransition} {...props} />;
}
