/** @jsx MyReact.createElement */
import { MyReact } from './fiber-react';

const MENU = {
  Employee: [
    { id: 1, name: "Grilled Chicken Salad", price: 12 },
    { id: 2, name: "Quinoa Bowl", price: 10 },
    { id: 3, name: "Salmon with Asparagus", price: 15 },
  ],
  Student: [
    { id: 4, name: "Veggie Burger & Fries", price: 8 },
    { id: 5, name: "Pasta Marinara", price: 7 },
    { id: 6, name: "Chicken Curry with Rice", price: 9 },
  ],
};

export default function App() {
  const [role, setRole] = MyReact.useState<"Employee" | "Student" | null>(null);
  const [orders, setOrders] = MyReact.useState<any[]>([]);
  const [view, setView] = MyReact.useState<"Selection" | "Dashboard">("Selection");

  const handleOrder = (item: any) => {
    setOrders((prev: any[]) => [...prev, { ...item, date: new Date().toLocaleDateString() }]);
    alert(`Ordered: ${item.name}`);
  };

  if (view === "Selection" && !role) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">PG Food System</h1>
          <p className="text-neutral-500 mb-8 italic serif">Select your role to view today's menu</p>
          
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => { setRole("Employee"); setView("Dashboard"); }}
              className="p-4 border-2 border-neutral-900 rounded-xl hover:bg-neutral-900 hover:text-white transition-all font-medium text-lg"
            >
              Employee
            </button>
            <button 
              onClick={() => { setRole("Student"); setView("Dashboard"); }}
              className="p-4 border-2 border-neutral-900 rounded-xl hover:bg-neutral-900 hover:text-white transition-all font-medium text-lg"
            >
              Student
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentMenu = role ? MENU[role] : [];

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-neutral-200 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
              {role} <span className="font-light italic serif text-neutral-400">Cafeteria</span>
            </h1>
            <p className="text-neutral-500 mt-1">Welcome back. Here is your curated menu for today.</p>
          </div>
          <button 
            onClick={() => { setRole(null); setView("Selection"); }}
            className="text-sm font-mono uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            Switch Role
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-6">Today's Selection</h2>
            <div className="space-y-4">
              {currentMenu.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex justify-between items-center group hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{item.name}</h3>
                    <p className="text-neutral-400 font-mono text-sm">${item.price.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => handleOrder(item)}
                    className="bg-neutral-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform"
                  >
                    Order
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-6">Your Recent Orders</h2>
            <div className="bg-neutral-900 text-white p-8 rounded-3xl min-h-[300px] flex flex-col">
              {orders.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-neutral-500 italic serif">
                  No orders placed yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-neutral-800 pb-3">
                      <span className="font-medium">{order.name}</span>
                      <span className="text-xs font-mono text-neutral-500">{order.date}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-auto pt-8 border-t border-neutral-800 flex justify-between items-end">
                <div>
                  <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Total Spent</p>
                  <p className="text-3xl font-light">${orders.reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Items</p>
                  <p className="text-xl">{orders.length}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
