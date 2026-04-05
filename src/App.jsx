import { useState, useEffect } from "react";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

import {
  FaChartPie,
  FaFileInvoice,
  FaSignOutAlt,
  FaTrash,
  FaEdit,
  FaUser,
  FaCog,
  FaChartLine,
  FaList,
  FaBullseye,
} from "react-icons/fa";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [transactions, setTransactions] = useState(
    JSON.parse(localStorage.getItem("transactions")) || []
  );

  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");

  const [role, setRole] = useState("Admin");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const addTransaction = () => {
    if (!text.trim() || amount === "") return;

    if (editId) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editId
            ? { ...t, text, amount: Number(amount), category }
            : t
        )
      );
      setEditId(null);
      setToast("✏️ Transaction Updated");
    } else {
      const newTransaction = {
        id: Date.now(),
        text,
        amount: Number(amount),
        category,
        date: new Date().toISOString(),
      };
      setTransactions([newTransaction, ...transactions]);
      setToast("✅ Transaction Added");
    }

    setText("");
    setAmount("");
    setCategory("General");
    setTimeout(() => setToast(""), 2000);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    setToast("❌ Transaction Deleted");
    setTimeout(() => setToast(""), 2000);
  };

  const editTransaction = (t) => {
    setText(t.text);
    setAmount(t.amount);
    setCategory(t.category);
    setEditId(t.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = transactions.filter((t) => {
    const matchSearch = t.text.toLowerCase().includes(search.toLowerCase());
    const matchDate = dateFilter
      ? new Date(t.date).toLocaleDateString() ===
        new Date(dateFilter).toLocaleDateString()
      : true;
    return matchSearch && matchDate;
  });

  const income = filtered.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const expense = filtered.filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0);
  const balance = income + expense;

  const monthlyData = {};
  filtered.forEach((t) => {
    const month = new Date(t.date).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    monthlyData[month] = (monthlyData[month] || 0) + t.amount;
  });

  const lineData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: "Monthly Flow",
        data: Object.values(monthlyData),
        borderColor: "#6366f1",
        tension: 0.4,
      },
    ],
  };

  const pieData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [income, Math.abs(expense)],
        backgroundColor: ["#22c55e", "#ef4444"],
      },
    ],
  };

  const [budgets, setBudgets] = useState(
  JSON.parse(localStorage.getItem("budgets")) || {}
);

const [budgetCategory, setBudgetCategory] = useState("General");
const [budgetAmount, setBudgetAmount] = useState("");
useEffect(() => {
  localStorage.setItem("budgets", JSON.stringify(budgets));
}, [budgets]);
const addBudget = () => {
  if (!budgetAmount) return;

  setBudgets((prev) => ({
    ...prev,
    [budgetCategory]: Number(budgetAmount),
  }));

  setBudgetAmount("");
};

  return (
    <div className={`flex min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-gray-100 to-gray-200"}`}>

      {toast && (
        <div className="fixed top-5 right-5 bg-black text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-64 bg-gradient-to-b from-purple-700 to-indigo-600 text-white p-6 flex flex-col rounded-r-3xl shadow-xl">

        <h2 className="text-2xl font-bold mb-10">💰 Finance</h2>

        <SidebarItem icon={<FaChartPie />} label="Dashboard" active={activePage==="dashboard"} onClick={()=>setActivePage("dashboard")} />
        <SidebarItem icon={<FaList />} label="Transactions" active={activePage==="transactions"} onClick={()=>setActivePage("transactions")} />
        <SidebarItem icon={<FaChartLine />} label="Analytics" active={activePage==="analytics"} onClick={()=>setActivePage("analytics")} />
        <SidebarItem icon={<FaBullseye />} label="Budget" active={activePage==="budget"} onClick={()=>setActivePage("budget")} />
        <SidebarItem icon={"📁"} label="Categories" active={activePage==="categories"} onClick={()=>setActivePage("categories")} />
        <SidebarItem icon={<FaFileInvoice />} label="Reports" active={activePage==="reports"} onClick={()=>setActivePage("reports")} />

        <hr className="my-6 opacity-30"/>

        <SidebarItem icon={<FaCog />} label="Settings" active={activePage==="settings"} onClick={()=>setActivePage("settings")} />
        <SidebarItem icon={<FaUser />} label="Profile" active={activePage==="profile"} onClick={()=>setActivePage("profile")} />

        <div className="mt-auto">
          <SidebarItem icon={<FaSignOutAlt />} label="Logout" />
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        <h1 className="text-3xl font-bold mb-6 capitalize">{activePage}</h1>

        {/* ✅ DASHBOARD FIXED */}
        {activePage === "dashboard" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Welcome Manoj 👋</h1>

              <div className="flex items-center gap-4">
                <input
                  placeholder="Search..."
                  onChange={(e)=>setSearch(e.target.value)}
                  className={`px-4 py-2 rounded-full shadow outline-none ${
                    darkMode
                      ? "bg-gray-800 text-white placeholder-gray-400"
                      : "bg-white text-black"
                  }`}
                />

                <input
                  type="date"
                  onChange={(e)=>setDateFilter(e.target.value)}
                  className={`px-3 py-2 rounded shadow ${
                    darkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-black"
                  }`}
                />

                <select
                  onChange={(e)=>setRole(e.target.value)}
                  className={`p-2 rounded shadow ${
                    darkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  <option>Admin</option>
                  <option>Viewer</option>
                </select>

                <button
                  onClick={()=>setDarkMode(!darkMode)}
                  className="w-10 h-10 rounded-full bg-gray-300 shadow flex items-center justify-center"
                >
                  {darkMode ? "🌙" : "☀️"}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <Card title="Income" value={income} color="from-green-400 to-green-600"/>
              <Card title="Expenses" value={Math.abs(expense)} color="from-red-400 to-red-600"/>
              <Card title="Balance" value={balance} color="from-blue-400 to-blue-600"/>
              <Card title="Transactions" value={filtered.length} color="from-orange-400 to-orange-600"/>
            </div>

            {role==="Admin" && (
              <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-xl shadow mb-6 flex gap-3`}>
                <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Description" className="p-2 border flex-1 rounded"/>
                <input value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="Amount" className="p-2 border rounded"/>
                <select value={category} onChange={(e)=>setCategory(e.target.value)} className="p-2 border rounded">
                    <option>General</option>
                    <option>Salary</option>
                    <option>Food & Dining</option>
                    <option>Rent</option>
                    <option>Groceries</option>
                    <option>Fuel</option>
                    <option>Shopping</option>
                    <option>Health</option>
                    <option>Entertainment</option>
                    <option>Subscriptions</option>
                    <option>Transportation</option>
                    <option>Insurance</option>
                    <option>Eduaction</option>
                    <option>Bills</option>
                    <option>Travel</option>
                    <option>Maintenance</option>
                    <option>Utilities</option>
                    <option>Miscellaneous</option>
                </select>
                <button onClick={addTransaction} className="bg-indigo-500 text-white px-4 rounded">
                  {editId?"Update":"Add"}
                </button>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <GlassCard><Line data={lineData}/></GlassCard>
              <GlassCard><Pie data={pieData}/></GlassCard>
            </div>

            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-5 rounded-2xl shadow`}>
              <h2 className="text-xl mb-4">Recent Activities</h2>

              {filtered.map((t)=>(
                <div key={t.id} className="flex justify-between border-b py-2">
                  <div>
                    <p>{t.text}</p>
                    <small>{new Date(t.date).toLocaleDateString()}</small>
                  </div>
                  <div className="flex gap-3">
                    <span>₹{t.amount}</span>
                    <FaEdit onClick={()=>editTransaction(t)}/>
                    <FaTrash onClick={()=>deleteTransaction(t.id)}/>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TRANSACTIONS */}
        {activePage==="transactions" && <Page title="All Transactions" data={filtered} />}

        {/* ANALYTICS */}
        {activePage==="analytics" && (
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard><Line data={lineData}/></GlassCard>
            <GlassCard><Pie data={pieData}/></GlassCard>
          </div>
        )}

        {activePage === "budget" && (
  <div className="space-y-6">

    {/* Add Budget */}
    <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-5 rounded-xl shadow flex gap-3`}>
      <select
        value={budgetCategory}
        onChange={(e) => setBudgetCategory(e.target.value)}
        className="p-2 border rounded"
      >
        <option>General</option>
        <option>Salary</option>
        <option>Food & Dining</option>
        <option>Rent</option>
        <option>Groceries</option>
        <option>Fuel</option>
        <option>Shopping</option>
        <option>Health</option>
        <option>Entertainment</option>
        <option>Subscriptions</option>
        <option>Transportation</option>
        <option>Insurance</option>
        <option>Eduaction</option>
        <option>Bills</option>
        <option>Travel</option>
        <option>Maintenance</option>
        <option>Utilities</option>
        <option>Miscellaneous</option>
      </select>

      <input
        value={budgetAmount}
        onChange={(e) => setBudgetAmount(e.target.value)}
        placeholder="Set Budget"
        className="p-2 border rounded"
      />

      <button
        onClick={addBudget}
        className="bg-indigo-500 text-white px-4 rounded"
      >
        Set
      </button>
    </div>

    {/* Budget List */}
    <div className="grid md:grid-cols-2 gap-6">
      {Object.keys(budgets).map((cat) => {
        const spent = transactions
          .filter((t) => t.category === cat && t.amount < 0)
          .reduce((a, t) => a + Math.abs(t.amount), 0);

        const budget = budgets[cat];
        const percent = Math.min((spent / budget) * 100, 100);

        return (
          <div
            key={cat}
            className={`${darkMode ? "bg-gray-800" : "bg-white"} p-5 rounded-xl shadow`}
          >
            <h2 className="text-lg font-semibold mb-2">{cat}</h2>

            <p className="text-sm mb-2">
              ₹{spent} / ₹{budget}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-300 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  percent > 80 ? "bg-red-500" : "bg-green-500"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>

            <p className="mt-2 text-sm">
              {budget - spent >= 0
                ? `Remaining ₹${budget - spent}`
                : `Overspent ₹${spent - budget}`}
            </p>
          </div>
        );
      })}
    </div>
  </div>
)}

        {/* ✅ REPORTS PAGE */}
        {activePage==="reports" && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-gray-500">Total Income</h2>
              <p className="text-2xl font-bold text-green-600">₹{income.toLocaleString()}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-gray-500">Total Expenses</h2>
              <p className="text-2xl font-bold text-red-600">₹{Math.abs(expense).toLocaleString()}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-gray-500">Net Balance</h2>
              <p className="text-2xl font-bold text-blue-600">₹{balance.toLocaleString()}</p>
            </div>

            <div className="md:col-span-3 bg-white p-6 rounded-2xl shadow">
              <h2 className="text-xl font-semibold mb-4">Monthly Summary</h2>

              {Object.entries(monthlyData).map(([month, value]) => (
                <div key={month} className="flex justify-between border-b py-2">
                  <span>{month}</span>
                  <span className={value >= 0 ? "text-green-500" : "text-red-500"}>
                    ₹{value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePage==="categories" && <SimplePage title="Categories" />}
        {activePage==="settings" && <SimplePage title="Settings" />}
        {activePage==="profile" && <SimplePage title="Profile" />}

      </div>
    </div>
  );
}

/* COMPONENTS */

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 mb-3 cursor-pointer px-3 py-2 rounded-xl ${
        active ? "bg-white text-black" : "opacity-80 hover:opacity-100"
      }`}
    >
      {icon} {label}
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className={`p-5 text-white bg-gradient-to-r ${color} rounded-2xl shadow`}>
      <p>{title}</p>
      <h2>{title==="Transactions"?value:`₹${value}`}</h2>
    </div>
  );
}

function GlassCard({ children }) {
  return <div className="bg-white p-4 rounded-xl shadow">{children}</div>;
}

function SimplePage({ title }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      {title} page coming soon 🚀
    </div>
  );
}

function Page({ title, data }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl mb-4">{title}</h2>
      {data.map((t)=>(
        <div key={t.id} className="flex justify-between border-b py-2">
          <p>{t.text}</p>
          <span>₹{t.amount}</span>
        </div>
      ))}
    </div>
  );
}