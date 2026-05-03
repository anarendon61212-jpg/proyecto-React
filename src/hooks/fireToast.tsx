import toast from 'react-hot-toast';
import dataJSON from '../../public/data.json';

interface AlertSetting {
  id: string;
  criterion: string;
  para: string;
  value: string | number;
  type: number;
}

interface DataItem {
  [key: string]: any;
}


const createToast = (title: string, msg: string, type: number) => {toast.custom((t: any) => (
  
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      }
      max-w-md w-full ${type === 0 ? "bg-[#04b20c]" : type === 1 ? "bg-[#eab90f]" : "bg-[#e13f32]"} shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4 ">
        <div className="flex items-start">
          
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">
              {title}
            </p>
            <p className="mt-1 text-sm text-white">
              {msg}
            </p>
          </div>
        </div>
      </div>
      <div className="flex">
        
          <button
          onClick={() => toast.dismiss(t.id)}
          type="button"
          className="mr-2 box-content rounded-none border-none opacity-100 hover:no-underline hover:opacity-50 focus:opacity-50 focus:shadow-none focus:outline-none text-white"
          data-te-toast-dismiss
          aria-label="Close">
          <span
            className="w-[1em] focus:opacity-100 disabled:pointer-events-none disabled:select-none disabled:opacity-25 [&.disabled]:pointer-events-none [&.disabled]:select-none [&.disabled]:opacity-25">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="h-6 w-6">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        </button>
          
      </div>
    </div>
  ))};
// let dataJSON: any;
// let headers = new Headers();
// headers.append('Access-Control-Allow-Origin', 'http://127.0.0.1:8000');
// headers.append("Access-Control-Allow-Methods", 'POST');
// headers.append("Access-Control-Allow-Headers", 'Content-Type, Authorization');
// fetch("http://127.0.0.1:8000/data",{method:'POST',headers:headers})
//   .then(response => {
//     return response
//   })
//   .then(data => {
//     console.log(data);
//     dataJSON=data;
//   })
const fireToast = () => {
  const alertSettings = localStorage.getItem("alertSettings");
  if (alertSettings) {
    const settings: AlertSetting[] = JSON.parse(alertSettings);
    for (const alertSetting of settings) {
      console.log(alertSetting);

      const numValue: number = parseFloat(alertSetting.value.toString());
      const value: number = isNaN(numValue) ? 0 : numValue;
      const para: string = parseInt(alertSetting.criterion) < 2 ? "delta_" + alertSetting.para : alertSetting.para;
      if (alertSetting.id === "ALL") {
        Object.keys(dataJSON).map((id: string) => {
          const dataItem: DataItem = dataJSON[id as keyof typeof dataJSON] as DataItem;
          const dataValue: number = parseFloat(dataItem[para]?.toString() || "0");
          const condition: boolean = alertSetting.criterion === '0' ? value <= -1 * dataValue :
            alertSetting.criterion === '1' || alertSetting.criterion === '3' ? value >= dataValue :
            alertSetting.criterion === '2' ? value <= dataValue :
            Math.abs(value - dataValue) < 0.001; // Igualdad aproximada para números
          const realValue: number = alertSetting.criterion === '0' ? dataValue * -1 : dataValue;
          if (condition) {
            const msg: string = `${alertSetting.para} of ${id} ${alertSetting.criterion === '0' ? "goes down by" : alertSetting.criterion === '1' ? "goes up by" : alertSetting.criterion === '2' ? "is smaller than" : alertSetting.criterion === '3' ? "is greater than" : "is equal to"} ${realValue.toString()}`;
            createToast(id, msg, alertSetting.type);
          }
        });
      } else {
        const id: string = alertSetting.id;
        const dataItem: DataItem = dataJSON[id as keyof typeof dataJSON] as DataItem;
        const dataValue: number = parseFloat(dataItem[para]?.toString() || "0");
        
        const condition: boolean = alertSetting.criterion === '0' ? value >= -1 * dataValue :
          alertSetting.criterion === '1' || alertSetting.criterion === '3' ? value >= dataValue :
          alertSetting.criterion === '2' ? value <= dataValue :
          Math.abs(value - dataValue) < 0.001; // Igualdad aproximada para números
        const realValue: number = alertSetting.criterion === '0' ? dataValue * -1 : dataValue;
        
        if (condition) {
          const msg: string = `${alertSetting.para} of ${id} ${alertSetting.criterion === '0' ? "goes down by" : alertSetting.criterion === '1' ? "goes up by" : alertSetting.criterion === '2' ? "is smaller than" : alertSetting.criterion === '3' ? "is greater than" : "is equal to"} ${realValue.toString()}`;
          createToast(id, msg, alertSetting.type);
        }
      }
    }
  }
};

export default fireToast;
  