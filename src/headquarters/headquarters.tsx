import { useState, useEffect, useMemo } from "react";
import styles from "./headquarters.module.css";
import TopControl from "../TopControl/TopControl";
import { useLocation, useNavigate } from 'react-router-dom';
import { getBranches } from "../services/branchService/branchService";
import type { Branch } from "../services/types/branch/branchService";
import { fetchAndTransformInventories, type inventory_material_record } from "../services/inventory/app_inventario";
import { getTransactions } from "../services/Product_Transactions/Transactions";
import {
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import type {Transaction} from "../services/types/Product_Transactions/transaction" 

type InventoryComposition = {
    nombre: string;
    cantidad: number;
    porcentaje: number;
    totalQuantity: number;
};

type TransactionSummary = {
    name: string;
    value: number;
};

type BalanceSummary = {
    name: string;
    value: number;
    color: string;
}

const filters = [
    { value: "inventory", label: "📦 Inventario" },
    { value: "money", label: "💰 Inversión" },
    { value: "composition", label: "📊 Composición Inventario" },
    { value: "transactions", label: "💳 Transacciones" },
];

const COLORS = ['#1dd7aa', '#3498db', '#e74c3c', '#f1c40f', '#9b59b6', '#2ecc71', '#e67e22', '#34495e']; 

const getWeekNumber = (d: Date): number => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const calculateMoneyData = (data: inventory_material_record[]) => {
  const totalPorDia: Record<string, number> = {};
  data.forEach((item) => {
    if (!item.created_at || !item.price || item.quantity === undefined) return;
    const fecha = new Date(item.created_at).toISOString().split("T")[0];
    const priceValue = parseFloat(item.price);
    if (isNaN(priceValue)) return;
    totalPorDia[fecha] = (totalPorDia[fecha] || 0) + priceValue * item.quantity;
  });
  
  const dias = Object.entries(totalPorDia).map(([fecha, valor]) => ({ periodo: "Día", fecha, valor }));

  const semanas: Record<string, number> = {};
  dias.forEach(({ fecha, valor }) => {
    const d = new Date(fecha);
    const weekNumber = getWeekNumber(d);
    const week = `${d.getFullYear()}-S${String(weekNumber).padStart(2, "0")}`;
    semanas[week] = (semanas[week] || 0) + valor;
  });
  const semanasArray = Object.entries(semanas).map(([semana, valor]) => ({ periodo: "Semana", fecha: semana, valor }));

  const meses: Record<string, number> = {};
  dias.forEach(({ fecha, valor }) => {
    const d = new Date(fecha);
    const mes = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    meses[mes] = (meses[mes] || 0) + valor;
  });
  const mesesArray = Object.entries(meses).map(([mes, valor]) => ({ periodo: "Mes", fecha: mes, valor }));

  const totalAnual = Object.values(totalPorDia).reduce((acc, val) => acc + val, 0);
  const añoArray = [{ periodo: "Año", fecha: new Date().getFullYear().toString(), valor: totalAnual }];

  return [...dias, ...semanasArray, ...mesesArray, ...añoArray];
};

const calculateInventoryComposition = (data: inventory_material_record[]): InventoryComposition[] => {
  const totals: Record<string, number> = {};
  let totalQuantity = 0;

  data.forEach((item) => {
    if (!item.product_name || item.quantity === undefined) return;
    totals[item.product_name] = (totals[item.product_name] || 0) + item.quantity;
    totalQuantity += item.quantity;
  });

  if (totalQuantity === 0) return [];

  const composition: InventoryComposition[] = Object.entries(totals).map(([nombre, cantidad]) => ({
    nombre,
    cantidad,
    porcentaje: (cantidad / totalQuantity) * 100,
    totalQuantity,
  }));

  composition.sort((a, b) => b.porcentaje - a.porcentaje);
  return composition;
};


const calculateTransactionData = (data: Transaction[]): TransactionSummary[] => {
    const counts: Record<string, number> = {};
    data.forEach((item) => {
        if (!item.transaction_type_name) return;
        counts[item.transaction_type_name] = (counts[item.transaction_type_name] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value, 
    }));
};


const calculateIncomeExpenses = (data: Transaction[]): BalanceSummary[] => {
    let totalIncome = 0;
    let totalExpense = 0;

    data.forEach((item) => {
        if (item.transaction_type_name && item.total_price !== undefined) { 
            const amount = parseFloat(item.total_price.toString());
            if (isNaN(amount)) return;

            const type = item.transaction_type_name.toLowerCase();
            
            if (type === 'venta') {
                totalIncome += amount;
            } else if (type === 'compra' || type === 'devolucion') {
                totalExpense += amount; 
            }
        }
    });

    return [
        { name: 'Ingresos', value: totalIncome, color: '#1dd7aa' }, 
        { name: 'Egresos', value: totalExpense, color: '#e74c3c' }, 
    ];
};

const filterByDateGeneric = (data: any[], startDate: string, endDate: string, dateField: string = 'fecha') => {
    if (!startDate && !endDate) return data;
    return data.filter(item => {
        const dateValue = item[dateField] || item.created_at; 
        
        if (!dateValue) return false;
        
        const itemDate = new Date(dateValue).getTime();
        const start = startDate ? new Date(startDate).getTime() : -Infinity;
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity; 
        
        return itemDate >= start && itemDate <= end;
    });
};


export default function Headquarters() {
    const location = useLocation();
    const navigate = useNavigate();

    const [branches, setBranches] = useState<Branch[]>([]);
    const [activeBranchId, setActiveBranchId] = useState<number | null>(null);
    const [branchError, setBranchError] = useState<string | null>(null);
    const activeBranch = useMemo(() => branches.find(b => b.id === activeBranchId), [branches, activeBranchId]);

    const [inventoryData, setInventoryData] = useState<inventory_material_record[]>([]);
    const [moneyData, setMoneyData] = useState<any[]>([]);
    const [compositionData, setCompositionData] = useState<InventoryComposition[]>([]);
    const [transactionsData, setTransactionsData] = useState<Transaction[]>([]); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeFilters, setActiveFilters] = useState<string[]>(["all"]);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<any>(null);

    useEffect(() => {
        const loadBranchesAndSetId = async () => {
            setBranchError(null);
            const params = new URLSearchParams(location.search);
            const urlBranchId = params.get('branchId');
            let initialBranchId: number | null = null;

            try {
                const branchList = await getBranches();
                setBranches(branchList);

                if (urlBranchId && !isNaN(Number(urlBranchId))) initialBranchId = Number(urlBranchId);
                else if (branchList.length > 0) initialBranchId = branchList[0].id;
            } catch (e) {
                setBranchError("Error al cargar la lista de sedes.");
            } finally {
                setActiveBranchId(initialBranchId);
            }
        };
        loadBranchesAndSetId();
    }, [location.search]);

    useEffect(() => {
        if (activeBranchId === null) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            let inventoryError: string | null = null;
            let transactionError: string | null = null;

            try {
                const rawInventoryData = await fetchAndTransformInventories(activeBranchId);
                if (!rawInventoryData || rawInventoryData.length === 0) {
                    inventoryError = `No hay inventario registrado para la sede: ${activeBranch?.name || activeBranchId}`;
                    setInventoryData([]);
                    setMoneyData([]);
                    setCompositionData([]);
                } else {
                    setInventoryData(rawInventoryData);
                    setMoneyData(calculateMoneyData(rawInventoryData));
                    setCompositionData(calculateInventoryComposition(rawInventoryData));
                }

            } catch (e) {
                inventoryError = e instanceof Error ? `Error de carga de inventario: ${e.message}` : "Ocurrió un error desconocido al cargar el inventario.";
                setInventoryData([]);
            }
            
            try {
                const rawTransactions = await getTransactions(); 
                setTransactionsData(rawTransactions);
            } catch (e) {
                transactionError = e instanceof Error ? `Error de carga de transacciones: ${e.message}` : "Ocurrió un error desconocido al cargar las transacciones.";
                setTransactionsData([]);
            }

            if (inventoryError && transactionError) {
                setError("Error al cargar inventario Y transacciones.");
            } else if (inventoryError) {
                setError(inventoryError);
            } else if (transactionError) {
                setError(transactionError);
            }
            
            setLoading(false);
        };

        fetchData();
    }, [activeBranchId, activeBranch?.name]);

    const filteredAndDatedTransactions = useMemo(() => {
        let data = transactionsData;
        
        const branchName = activeBranch?.name;
        if (branchName) {
            data = data.filter(t => t.branch_name === branchName);
        }
        
        data = filterByDateGeneric(data, startDate, endDate, 'created_at') as Transaction[];
        
        return data;
    }, [transactionsData, activeBranch?.name, startDate, endDate]);

    const filteredTransactionData: TransactionSummary[] = useMemo(() => {
        return calculateTransactionData(filteredAndDatedTransactions);
    }, [filteredAndDatedTransactions]);

    const incomeExpenseData = useMemo(() => {
        return calculateIncomeExpenses(filteredAndDatedTransactions);
    }, [filteredAndDatedTransactions]);

    const filterInventoryBySearch = (data: inventory_material_record[]) => {
        if (!search) return data;
        return data.filter(item => item.product_name.toLowerCase().includes(search.toLowerCase()));
    };

    const filterCompositionBySearch = (data: InventoryComposition[]) => {
        if (!search) return data;
        return data.filter(item => item.nombre.toLowerCase().includes(search.toLowerCase()));
    };
    
    const filterByDateInventory = (data: inventory_material_record[]) => {
        return filterByDateGeneric(data, startDate, endDate, 'created_at');
    };

    const finalInventoryData = useMemo(() => {
        let data = inventoryData;
        data = filterInventoryBySearch(data);
        data = filterByDateInventory(data);
        return data;
    }, [inventoryData, search, startDate, endDate]);
    
    const filteredMoneyData = useMemo(() => {
        const datedData = filterByDateGeneric(moneyData, startDate, endDate);
        const groupedData = datedData.reduce((acc: Record<string, any[]>, item: any) => {
            acc[item.periodo] = acc[item.periodo] || [];
            acc[item.periodo].push(item);
            return acc;
        }, {});
        Object.keys(groupedData).forEach(periodo => {
            groupedData[periodo].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        });
        return groupedData;
    }, [moneyData, startDate, endDate]);

    const totalTransactions = useMemo(() => 
        filteredTransactionData.reduce((sum, item) => sum + item.value, 0)
    , [filteredTransactionData]);

    const totalBalance = useMemo(() => 
        incomeExpenseData.reduce((sum, item) => sum + item.value, 0)
    , [incomeExpenseData]);


    const openModal = (item: any) => { 
        if (item.id && typeof item.id === 'number' && item.app_user_name) {
            const transactionDetail = filteredAndDatedTransactions.find(t => t.id === item.id);
            setModalContent(transactionDetail || item);
        } else {
             setModalContent(item);
        }
        setModalOpen(true); 
    };
    const closeModal = () => { setModalOpen(false); setModalContent(null); };

    const toggleFilter = (value: string) => {
        if (value === "all") { setActiveFilters(activeFilters.includes("all") ? [] : ["all"]); return; }
        const currentFilters = activeFilters.filter(f => f !== "all");
        if (currentFilters.includes(value)) {
            const newFilters = currentFilters.filter(f => f !== value);
            setActiveFilters(newFilters.length === 0 ? ["all"] : newFilters);
        } else setActiveFilters([...currentFilters, value]);
    };

    const filterIsActive = (value: string) => activeFilters.includes("all") || activeFilters.includes(value);

    const handleBranchSelectInternal = (event: React.ChangeEvent<HTMLSelectElement>) => {
        navigate(`/headquarters?branchId=${Number(event.target.value)}`);
    };

    const handleBackToMap = () => navigate('/mapa');
    
    const isSaldosTableActive = filterIsActive("transactions");
    const isChartsActive = filterIsActive("transactions");
    
    const activeBottomBlocks = isSaldosTableActive && isChartsActive ? 2 : (isSaldosTableActive || isChartsActive ? 1 : 0);
    const fullWidthClass = activeBottomBlocks === 1 ? styles.fullWidthBlock : '';

    return (
        <div className={styles.container}>
            <TopControl 
                onBackClick={handleBackToMap}
                title={
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        <span>🚀 Panel de Inventario: </span>
                        <select
                            value={activeBranchId || ''}
                            onChange={handleBranchSelectInternal}
                            disabled={loading || branches.length === 0}
                            className={styles.branchSelector} 
                        >
                            {branches.length === 0 && <option value="">Cargando Sedes...</option>}
                            {branches.map((branch) => (<option key={branch.id} value={branch.id}>{branch.name}</option>))}
                        </select>
                    </div>
                } 
            />

            {branchError && <p className={styles.errorMessage}>{branchError}</p>}

            <div className={styles.filterBar}>
                {filters.map(filter => (
                    <button
                        key={filter.value}
                        className={`${styles.filterButton} ${activeFilters.includes(filter.value) ? styles.activeFilter : ""}`}
                        onClick={() => toggleFilter(filter.value)}
                    >{filter.label}</button>
                ))}

                <input type="text" placeholder="🔍 Buscar por nombre..." className={styles.searchInput} value={search} onChange={(e) => setSearch(e.target.value)} />
                <input type="date" className={styles.dateInput} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" className={styles.dateInput} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className={styles.secondary_container}>
                {filterIsActive("inventory") && (
                     <div className={`${styles.block} ${styles.inventoryTableContainer}`}>
                    <h2 className={styles.sectionTitle}>📋 Resumen Inventario</h2>
                    {loading && <p className={styles.loadingMessage}>Cargando inventario para {activeBranch?.name || 'la sede seleccionada'}...</p>}
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {!loading && !error && (
                        <>
                            {finalInventoryData.length > 0 ? (
                                <>
                                    <table className={`${styles.table} ${styles.inventoryTable} ${styles.tableHeader}`}>
                                        <thead><tr><th>Nombre</th><th>Cantidad</th><th>Tamaño</th></tr></thead>
                                    </table>
                                    <div className={styles.tableBodyScroll}>
                                        <table className={`${styles.table} ${styles.inventoryTable}`}>
                                            <tbody>
                                                {finalInventoryData.map((item, i) => (
                                                    <tr key={i}>
                                                        <td>{item.product_name}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>{item.product_size}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (<p className={styles.noDataMessage}>No hay datos de inventario o no coinciden con la búsqueda/filtros para {activeBranch?.name}.</p>)}
                        </>
                    )}
                </div>
                )}

                {filterIsActive("money") && (
                     <div className={styles.block}>
                    <h2 className={styles.sectionTitle}>💰 Dinero Invertido</h2>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {loading && <p className={styles.loadingMessage}>Calculando inversión...</p>}
                    {!loading && !error && (
                        <div className={styles.moneyCards}>
                            {Object.keys(filteredMoneyData).map(periodo => (
                                <div key={periodo} className={styles.moneyGroup}>
                                    <h3 className={styles.moneyGroupTitle}>{periodo}</h3>
                                    {filteredMoneyData[periodo].map((item, i) => (
                                        <div key={i} className={styles.moneyCard} onClick={() => openModal(item)} style={{ cursor: "pointer" }}>
                                            <p className={styles.moneyCardDate}>{item.fecha}</p>
                                            <p className={styles.moneyCardValue}>${item.valor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                    {Object.keys(filteredMoneyData).length === 0 && !loading && !error && <p className={styles.noDataMessage}>No hay datos de inversión para el rango seleccionado.</p>}
                </div>
                )}

                {filterIsActive("composition") && (
                    <div className={`${styles.block} ${styles.stockBlock}`}>
                    <h2 className={styles.sectionTitle}>📊 Composición Inventario por Material</h2>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {loading && <p className={styles.loadingMessage}>Calculando composición...</p>}
                    {!loading && !error && (
                        <ul className={styles.employeeList}>
                            {filterCompositionBySearch(compositionData).map((item, i) => (
                                <li key={i} className={styles.employeeItem}>
                                    <span>{item.nombre}</span>
                                    <div className={styles.barContainer}>
                                        <div className={styles.bar} style={{ width: `${item.porcentaje}%`, background: i === 0 ? "orange" : "lightblue" }}></div>
                                    </div>
                                    <span className={styles.percent}>{item.porcentaje.toFixed(1)}%</span>
                                </li>
                            ))}
                            {filterCompositionBySearch(compositionData).length === 0 && (<p className={styles.noDataMessage}>No hay materiales que coincidan con la búsqueda.</p>)}
                        </ul>
                    )}
                </div>
                )}
            </div> 

            {(isSaldosTableActive || isChartsActive) && (
                <div className={styles.bottom_container}>
                    
                    {isSaldosTableActive && (
                        <div className={`${styles.block} ${styles.transactionBlock} ${styles.inventoryTableContainer} ${fullWidthClass}`}>
                            <h2 className={styles.sectionTitle}>🧾 Transacciones Detalladas (Saldos)</h2>
                            {loading && <p className={styles.loadingMessage}>Cargando transacciones...</p>}
                            {!loading && filteredAndDatedTransactions.length > 0 ? (
                                <>
                                    <table className={`${styles.table} ${styles.inventoryTable} ${styles.tableHeader}`}>
                                        <thead>
                                            <tr>
                                                <th>Tipo</th>
                                                <th>Empleado</th>
                                                <th>Descripción</th>
                                                <th>Cantidad</th>
                                                <th>Precio Total</th>
                                            </tr>
                                        </thead>
                                    </table>
                                    <div className={styles.tableBodyScroll}>
                                        <table className={`${styles.table} ${styles.inventoryTable}`}>
                                            <tbody>
                                                {filteredAndDatedTransactions
                                                    .filter(item => item.transaction_type_name && item.total_price !== undefined)
                                                    .map((item, i) => (
                                                    <tr key={item.id || i} onClick={() => openModal(item)} style={{ cursor: 'pointer' }}>
                                                        <td style={{ color: item.transaction_type_name === 'venta' ? '#1dd7aa' : '#e74c3c' }}>
                                                            {item.transaction_type_name!.toUpperCase()}
                                                        </td>
                                                        <td>{item.app_user_name}</td>
                                                        <td>{item.description}</td>
                                                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                                            ${item.total_price!.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (!loading && <p className={styles.noDataMessage}>No hay transacciones para el rango seleccionado o sede actual.</p>)}
                        </div>
                    )}


                    {isChartsActive && (
                        <div className={`${styles.block} ${styles.transactionBlock} ${styles.transactionTypeBlock} ${fullWidthClass}`}>
                            <h2 className={styles.sectionTitle}>💳 Transacciones por Tipo y Balance</h2>
                         
                            {loading && <p className={styles.loadingMessage}>Cargando transacciones...</p>}
                            {!loading && (filteredTransactionData.length > 0 || incomeExpenseData.length > 0) ? (
                                <div className={styles.transactionContent}>
                                    
                                    {/* 1. GRÁFICA DE CONTEO */}
                                    <div className={styles.chartCard}>
                                        <h3 className={styles.chartSubtitle}>Conteo por Tipo (Total: {totalTransactions.toLocaleString()})</h3>
                                        <ResponsiveContainer width="100%" height="90%"> 
                                            <PieChart>
                                                <Pie
                                                    data={filteredTransactionData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={30} 
                                                    outerRadius={50} 
                                                    fill="#8884d8"
                                                    labelLine={false}
                                                >
                                                    {filteredTransactionData.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: '#ffffffff',
                                                        border: '1px solid #1DD7AA', 
                                                        borderRadius: '8px', 
                                                        color: '#fff',
                                                    }}
                                                    formatter={(value: number, name: string) => {
                                                        const percent = totalTransactions === 0 ? 0 : (value / totalTransactions) * 100;
                                                        return [
                                                            `${value.toLocaleString()} (${percent.toFixed(1)}%)`, 
                                                            name 
                                                        ];
                                                    }} 
                                                    labelStyle={{ color: '#1DD7AA', fontWeight: 'bold' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    
                                    {/* 2. GRÁFICA DE SALDOS/BALANCE */}
                                    <div className={styles.chartCard}>
                                        <h3 className={styles.chartSubtitle}>Ingresos vs Egresos (Total: ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })})</h3>
                                        <ResponsiveContainer width="100%" height="90%"> 
                                            <PieChart>
                                                <Pie
                                                    data={incomeExpenseData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={30} 
                                                    outerRadius={50} 
                                                    fill="#8884d8" 
                                                    labelLine={false}
                                                >
                                                    {incomeExpenseData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: '#ffffffff',
                                                        border: '1px solid #1DD7AA', 
                                                        borderRadius: '8px', 
                                                        color: '#fff',
                                                    }}
                                                    formatter={(value: number, name: string) => {
                                                        const percent = totalBalance === 0 ? 0 : (value / totalBalance) * 100;
                                                        return [
                                                            `${value.toLocaleString(undefined, {style: 'currency', currency: 'COL', minimumFractionDigits: 2})} (${percent.toFixed(1)}%)`, 
                                                            name 
                                                        ];
                                                    }} 
                                                    labelStyle={{ color: '#1DD7AA', fontWeight: 'bold' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* LEYENDA (Fusionada y Limpia) */}
                                    <ul className={styles.transactionList}>
                                        {/* Items de Conteo */}
                                        {filteredTransactionData.map((item, index) => (
                                            <li key={`conteo-${index}`} className={styles.legendItem}>
                                                <span style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                                <span>{item.name}: {item.value.toLocaleString()}</span>
                                            </li>
                                        ))}
                                        
                                        {/* Items de Balance */}
                                        {incomeExpenseData.map((item, index) => (
                                            <li key={`balance-${index}`} className={styles.legendItem}>
                                                <span style={{ backgroundColor: item.color }}></span>
                                                <span>{item.name}: ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (!loading && <p className={styles.noDataMessage}>No hay datos de transacciones para el rango seleccionado o sede actual.</p>)}
                            </div>
                       
                    )}
                </div>
            )}
            

            {modalOpen && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={closeModal}>&times;</button>
                        
                        {modalContent?.app_user_name ? (
                            <>
                                <h2>Detalles de Transacción: {modalContent.transaction_type_name}</h2>
                                <p><strong>ID:</strong> {modalContent.id}</p>
                                <p><strong>Empleado:</strong> {modalContent.app_user_name}</p>
                                <p><strong>Descripción:</strong> {modalContent.description}</p>
                                <p><strong>Producto:</strong> {modalContent.product}</p>
                                <p><strong>Cantidad:</strong> {modalContent.quantity}</p>
                                <p><strong>Precio Unitario:</strong> ${modalContent.unit_price?.toLocaleString()}</p>
                                <p><strong>Precio Total:</strong> <span style={{color: '#1dd7aa', fontWeight: 'bold'}}>${modalContent.total_price?.toLocaleString()}</span></p>
                                <p><strong>Fecha:</strong> {new Date(modalContent.transaction_date).toLocaleDateString()}</p>
                            </>
                        ) : (
                            <>
                                <h2>{modalContent?.periodo || modalContent?.nombre || "Detalle"}</h2>
                                {modalContent?.detalle?.length > 0 ? (
                                    <ul>{modalContent.detalle.map((item: any, i: number) => <li key={i}>{item.nombre}: {item.cantidad} unidades</li>)}</ul>
                                ) : (
                                    <>
                                        {modalContent?.valor !== undefined && <p>Valor Invertido: ${modalContent.valor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>}
                                        {modalContent?.fecha && <p>Fecha/Período: {modalContent.fecha}</p>}
                                        {modalContent?.porcentaje !== undefined && <p>Porcentaje del total: {modalContent.porcentaje.toFixed(1)}%</p>}
                                        {modalContent?.cantidad !== undefined && <p>Cantidad Total: {modalContent.cantidad}</p>}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}