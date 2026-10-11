import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("notFound.subtitle")}</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          {t("notFound.return")}
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
