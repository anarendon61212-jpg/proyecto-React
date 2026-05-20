import CardFour from '../../components/CardFour.tsx';
import CardOne from '../../components/CardOne.tsx';
import CardThree from '../../components/CardThree.tsx';
import CardTwo from '../../components/CardTwo.tsx';
import ChartOne from '../../components/ChartOne.tsx';
import ChartThree from '../../components/ChartThree.tsx';
import ChartTwo from '../../components/ChartTwo.tsx';
import MapOne from '../../components/MapOne.tsx';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const ECommerce = () => {
  const user = useSelector((state: RootState) => state.user.user);
  return (
    <>
      {user?.code === 'GUEST' && (
        <div className="mb-6 rounded-sm border border-primary bg-primary/5 px-6 py-4 dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-black dark:text-white">
                ¿Quieres formar parte de esta comunidad educativa?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Únete como Profesor o Estudiante y comienza a aprender hoy
              </p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                Regístrate como Profesor
              </button>
              <button className="rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white hover:bg-secondary/90 transition-colors">
                Regístrate como Estudiante
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardOne />
        <CardTwo />
        <CardThree />
        <CardFour />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne />
        <ChartTwo />
        <ChartThree />
        <MapOne />
      </div>
    </>
  );
};

export default ECommerce;
