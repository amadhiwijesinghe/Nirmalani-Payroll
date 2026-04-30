import { useState, useEffect } from "react";
import axios from "axios";
const API = "https://nirmalani-payroll-production.up.railway.app";

export default function PlantationPayroll() {
  const [workers, setWorkers] = useState([]);
  const [data, setData] = useState([]);

  const [name, setName] = useState("");
  const [rate, setRate] = useState("");

  const [workerId, setWorkerId] = useState("");
  const [days, setDays] = useState("");
  const [month, setMonth] = useState("");

  useEffect(() => {
    fetchWorkers();
    fetchData();
  }, []);

  const fetchWorkers = async () => {
    const res = await axios.get(`${API}/plantation-workers`);
    setWorkers(res.data);
  };

  const fetchData = async () => {
    const res = await axios.get(`${API}/plantation-data`);
    setData(res.data);
  };

  const addWorker = async () => {
    await axios.post(`${API}/plantation-workers`, {
      name,
      rate_per_day: rate,
    });
    setName("");
    setRate("");
    fetchWorkers();
  };

  const addAttendance = async () => {
    await axios.post(`${API}/plantation-attendance`, {
      worker_id: workerId,
      days_worked: days,
      month,
    });
    setDays("");
    setMonth("");
    fetchData();
  };

  // 🔥 FULL PAYROLL CALCULATION
  const calculate = (days, rate) => {
    const amount = days * rate;

    const epf_8 = amount * 0.08;
    const epf_12 = amount * 0.12;
    const epf_20 = epf_8 + epf_12;
    const etf = amount * 0.03;

    const total_deduction = epf_8;
    const balance = amount - total_deduction;

    return {
      amount,
      epf_8,
      epf_12,
      epf_20,
      etf,
      total_deduction,
      balance,
    };
  };

  // 🔥 GRAND TOTAL
  const totals = data.reduce(
    (acc, row) => {
      const c = calculate(row.days_worked || 0, row.rate_per_day);

      acc.amount += c.amount;
      acc.epf_8 += c.epf_8;
      acc.epf_12 += c.epf_12;
      acc.epf_20 += c.epf_20;
      acc.etf += c.etf;
      acc.total_deduction += c.total_deduction;
      acc.balance += c.balance;

      return acc;
    },
    {
      amount: 0,
      epf_8: 0,
      epf_12: 0,
      epf_20: 0,
      etf: 0,
      total_deduction: 0,
      balance: 0,
    }
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>🌿 Plantation Workers</h2>

      {/* ADD WORKER */}
      <h3>Add Worker</h3>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Rate" value={rate} onChange={(e) => setRate(e.target.value)} />
      <button onClick={addWorker}>Add</button>

      {/* ADD ATTENDANCE */}
      <h3>Add Attendance</h3>
      <select onChange={(e) => setWorkerId(e.target.value)}>
        <option>Select Worker</option>
        {workers.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>

      <input placeholder="Days" value={days} onChange={(e) => setDays(e.target.value)} />
      <input placeholder="Month (2026-04)" value={month} onChange={(e) => setMonth(e.target.value)} />
      <button onClick={addAttendance}>Add Attendance</button>

      {/* PAYROLL TABLE */}
      <h3>Payroll Table</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Name</th>
            <th>Days</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>EPF 8%</th>
            <th>Total Deduction</th>
            <th>Balance Pay</th>
            <th>EPF 12%</th>
            <th>EPF 20%</th>
            <th>ETF 3%</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => {
            const c = calculate(row.days_worked || 0, row.rate_per_day);

            return (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.days_worked}</td>
                <td>{row.rate_per_day}</td>

                <td>{c.amount.toFixed(2)}</td>
                <td>{c.epf_8.toFixed(2)}</td>
                <td>{c.total_deduction.toFixed(2)}</td>
                <td>{c.balance.toFixed(2)}</td>
                <td>{c.epf_12.toFixed(2)}</td>
                <td>{c.epf_20.toFixed(2)}</td>
                <td>{c.etf.toFixed(2)}</td>
              </tr>
            );
          })}

          {/* 🔥 GRAND TOTAL ROW */}
          <tr style={{ fontWeight: "bold", background: "#eee" }}>
            <td colSpan="3">GRAND TOTAL</td>
            <td>{totals.amount.toFixed(2)}</td>
            <td>{totals.epf_8.toFixed(2)}</td>
            <td>{totals.total_deduction.toFixed(2)}</td>
            <td>{totals.balance.toFixed(2)}</td>
            <td>{totals.epf_12.toFixed(2)}</td>
            <td>{totals.epf_20.toFixed(2)}</td>
            <td>{totals.etf.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}