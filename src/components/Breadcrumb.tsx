import { Link } from 'react-router-dom';
interface BreadcrumbProps {
  pageName: string;
}
const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        {pageName}
      </h2>

      <nav>
        <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <Link
              className="hover:text-gray-700 dark:hover:text-gray-200"
              to="/"
            >
              Dashboard
            </Link>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="font-medium text-gray-700 dark:text-gray-200">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
