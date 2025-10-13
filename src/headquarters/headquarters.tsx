import { useState, useEffect, useMemo } from "react";
import styles from "./headquarters.module.css";
import TopControl from "../TopControl/TopControl";
import { useLocation, useNavigate } from 'react-router-dom';
import { getBranches } from "../services/branchService/branchService";
import type { Branch } from "../services/types/branch/branchService";
import { fetchAndTransformInventories, type inventory_material_record } from "../services/inventory/app_inventario";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


type InventoryComposition = {
  nombre: string;
  cantidad: number;
  porcentaje: number;
  totalQuantity: number;
};


const filters = [
  { value: "inventory", label: "📦 Inventario" },
  { value: "money", label: "💰 Inversión" },
  { value: "composition", label: "📊 Composición Inventario" },
];


const getWeekNumber = (d: Date): number => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return weekNo;
};

const calculateMoneyData = (data: inventory_material_record[]) => {
  const totalPorDia: Record<string, number> = {};

  data.forEach((item) => {
    if (!item.created_at || !item.price || item.quantity === undefined) return;

    const fecha = new Date(item.created_at).toISOString().split("T")[0];
    const priceValue = parseFloat(item.price);

    if (isNaN(priceValue)) return;

    const totalItem = priceValue * item.quantity;
    totalPorDia[fecha] = (totalPorDia[fecha] || 0) + totalItem;
  });

  const dias = Object.entries(totalPorDia).map(([fecha, valor]) => ({
    periodo: "Día",
    fecha,
    valor,
  }));

  const semanas: Record<string, number> = {};
  dias.forEach(({ fecha, valor }) => {
    const d = new Date(fecha);
    const weekNumber = getWeekNumber(d);
    const week = `${d.getFullYear()}-S${String(weekNumber).padStart(2, "0")}`;
    semanas[week] = (semanas[week] || 0) + valor;
  });
  const semanasArray = Object.entries(semanas).map(([semana, valor]) => ({
    periodo: "Semana",
    fecha: semana,
    valor,
  }));

  const meses: Record<string, number> = {};
  dias.forEach(({ fecha, valor }) => {
    const d = new Date(fecha);
    const mes = `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    meses[mes] = (meses[mes] || 0) + valor;
  });
  const mesesArray = Object.entries(meses).map(([mes, valor]) => ({
    periodo: "Mes",
    fecha: mes,
    valor,
  }));

  const totalAnual = Object.values(totalPorDia).reduce(
    (acc, val) => acc + val,
    0
  );
  const añoArray = [
    {
      periodo: "Año",
      fecha: new Date().getFullYear().toString(),
      valor: totalAnual,
    },
  ];

  return [...dias, ...semanasArray, ...mesesArray, ...añoArray];
};

const calculateInventoryComposition = (
  data: inventory_material_record[]
): InventoryComposition[] => {
  const totals: Record<string, number> = {};
  let totalQuantity = 0;

  data.forEach((item) => {
    if (!item.product_name || item.quantity === undefined) return;

    totals[item.product_name] =
      (totals[item.product_name] || 0) + item.quantity;
    totalQuantity += item.quantity;
  });

  if (totalQuantity === 0) return [];

  const composition: InventoryComposition[] = Object.entries(totals).map(
    ([nombre, cantidad]) => ({
      nombre,
      cantidad,
      porcentaje: (cantidad / totalQuantity) * 100,
      totalQuantity,
    })
  );

  composition.sort((a, b) => b.porcentaje - a.porcentaje);

  return composition;
};


export default function Headquarters() {
  const location = useLocation();
  const navigate = useNavigate();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<number | null>(null);
  const [branchError, setBranchError] = useState<string | null>(null);
  const activeBranch = useMemo(() => branches.find(b => b.id === activeBranchId), [branches, activeBranchId]);

  const [inventoryData, setInventoryData] = useState<inventory_material_record[]>(
    []
  );
  const [moneyData, setMoneyData] = useState<any[]>([]);
  const [compositionData, setCompositionData] = useState<InventoryComposition[]>(
    []
  );
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

        if (urlBranchId && !isNaN(Number(urlBranchId))) {
          initialBranchId = Number(urlBranchId);
        } else if (branchList.length > 0) {
          initialBranchId = branchList[0].id;
        }

      } catch (e) {
        setBranchError("Error al cargar la lista de sedes.");
        console.error("Error al cargar sedes:", e);
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

    const fetchInventory = async () => {
      setLoading(true);
      setError(null);

      try {
        const rawData = await fetchAndTransformInventories(activeBranchId);

        if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
          setError(`No hay inventario registrado para la sede: ${activeBranch?.name || activeBranchId}`);
          setInventoryData([]);
          setMoneyData([]);
          setCompositionData([]);
          return;
        }

        setInventoryData(rawData);
        setMoneyData(calculateMoneyData(rawData));
        setCompositionData(calculateInventoryComposition(rawData));

      } catch (e) {
        if (e instanceof Error) {
          setError(`Error de carga de inventario: ${e.message}`);
        } else {
          setError("Ocurrió un error desconocido al cargar el inventario.");
        }
        setInventoryData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [activeBranchId]);


  const filterInventoryBySearch = (data: inventory_material_record[]) => {
    if (!search) return data;
    return data.filter((item) =>
      item.product_name.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filterCompositionBySearch = (data: InventoryComposition[]) => {
    if (!search) return data;
    return data.filter((item) =>
      item.nombre.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filterByDateInventory = (data: inventory_material_record[]) => {
    if (!startDate && !endDate) return data;
    return data.filter((item) => {
      if (!item.created_at) return false;
      const itemDate = new Date(item.created_at).getTime();
      const start = startDate ? new Date(startDate).getTime() : -Infinity;
      const end = endDate ? new Date(endDate).getTime() : Infinity;
      return itemDate >= start && itemDate <= end;
    });
  };

  const filterByDateGeneric = (data: any[]) => {
    if (!startDate && !endDate) return data;
    return data.filter((item) => {
      if (!item.fecha) return false;
      const itemDate = new Date(item.fecha).getTime();
      const start = startDate ? new Date(startDate).getTime() : -Infinity;
      const end = endDate ? new Date(endDate).getTime() : Infinity;
      return itemDate >= start && itemDate <= end;
    });
  };

  const openModal = (item: any) => {
    setModalContent(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  const toggleFilter = (value: string) => {
    if (value === "all") {
      setActiveFilters(activeFilters.includes("all") ? [] : ["all"]);
      return;
    }
    const currentFilters = activeFilters.filter((f) => f !== "all");
    if (currentFilters.includes(value)) {
      const newFilters = currentFilters.filter((f) => f !== value);
      setActiveFilters(newFilters.length === 0 ? ["all"] : newFilters);
    } else {
      setActiveFilters([...currentFilters, value]);
    }
  };

  const filterIsActive = (value: string) =>
    activeFilters.includes("all") || activeFilters.includes(value);

  const filteredMoneyData = useMemo(() => {
    const datedData = filterByDateGeneric(moneyData);

    const groupedData = datedData.reduce(
      (acc: Record<string, any[]>, item: any) => {
        acc[item.periodo] = acc[item.periodo] || [];
        acc[item.periodo].push(item);
        return acc;
      },
      {}
    );

    Object.keys(groupedData).forEach(periodo => {
      groupedData[periodo].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    });

    return groupedData;
  }, [moneyData, startDate, endDate]);

  const handleBranchSelectInternal = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = Number(event.target.value);
    navigate(`/headquarters?branchId=${newId}`);
  };

  const finalInventoryData = useMemo(() => {
    let data = inventoryData;
    data = filterInventoryBySearch(data);
    data = filterByDateInventory(data);
    return data;
  }, [inventoryData, search, startDate, endDate]);

  const handleBackToMap = () => {
    navigate('/mapa');
  };


  return (
    <div className={styles.container}>
      <TopControl 
    onBackClick={handleBackToMap}
    title={
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%' 
        }}>
            <span>🚀 Panel de Inventario: </span>
            <select
                value={activeBranchId || ''}
                onChange={handleBranchSelectInternal}
                disabled={loading || branches.length === 0}
                // Aplica la clase CSS
                className={styles.branchSelector} 
            >
                {branches.length === 0 && <option value="">Cargando Sedes...</option>}
                {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                        {branch.name}
                    </option>
                ))}
            </select>
        </div>
    } 
/>
      {branchError && <p className={styles.errorMessage}>{branchError}</p>}


      <div className={styles.filterBar}>
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={`${styles.filterButton} ${activeFilters.includes(filter.value) ? styles.activeFilter : ""
              }`}
            onClick={() => toggleFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}

        <input
          type="text"
          placeholder="🔍 Buscar por nombre..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          className={styles.dateInput}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className={styles.dateInput}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className={styles.secondary_container}>
        {filterIsActive("inventory") && (
          <div className={`${styles.block} ${styles.inventoryTableContainer}`}>
            <h2 className={styles.sectionTitle}>📋 Resumen Inventario</h2>

            {loading && (
              <p className={styles.loadingMessage}>Cargando inventario para {activeBranch?.name || 'la sede seleccionada'}...</p>
            )}
            {error && <p className={styles.errorMessage}>{error}</p>}

            {!loading && !error && (
              <>
                {finalInventoryData.length > 0 ? (
                  <>
                    <table
                      className={`${styles.table} ${styles.inventoryTable} ${styles.tableHeader}`}
                    >
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Cantidad</th>
                          <th>Tamaño</th>
                        </tr>
                      </thead>
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
                ) : (
                  <p className={styles.noDataMessage}>
                    No hay datos de inventario o no coinciden con la búsqueda/filtros para {activeBranch?.name}.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {filterIsActive("money") && (
          <div className={styles.block}>
            <h2 className={styles.sectionTitle}>💰 Dinero Invertido</h2>
            {error && filterIsActive("money") && <p className={styles.errorMessage}>{error}</p>}
            {loading && filterIsActive("money") && <p className={styles.loadingMessage}>Calculando inversión...</p>}

            {!loading && !error && (
              <div className={styles.moneyCards}>
                {Object.keys(filteredMoneyData).map((periodo) => (
                  <div key={periodo} className={styles.moneyGroup}>
                    <h3 className={styles.moneyGroupTitle}>{periodo}</h3>
                    {filteredMoneyData[periodo].map((item, i) => (
                      <div
                        key={i}
                        className={styles.moneyCard}
                        onClick={() => openModal(item)}
                        style={{ cursor: "pointer" }}
                      >
                        <p className={styles.moneyCardDate}>{item.fecha}</p>
                        <p className={styles.moneyCardValue}>
                          $
                          {item.valor.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {Object.keys(filteredMoneyData).length === 0 && !loading && !error && (
              <p className={styles.noDataMessage}>
                No hay datos de inversión para el rango seleccionado.
              </p>
            )}
          </div>
        )}

        {filterIsActive("composition") && (
          <div className={`${styles.block} ${styles.stockBlock}`}>
            <h2 className={styles.sectionTitle}>
              📊 Composición Inventario por Material
            </h2>
            {error && filterIsActive("composition") && <p className={styles.errorMessage}>{error}</p>}
            {loading && filterIsActive("composition") && <p className={styles.loadingMessage}>Calculando composición...</p>}

            {!loading && !error && (
              <ul className={styles.employeeList}>
                {filterCompositionBySearch(compositionData).map((item, i) => (
                  <li key={i} className={styles.employeeItem}>
                    <span>{item.nombre}</span>
                    <div className={styles.barContainer}>
                      <div
                        className={styles.bar}
                        style={{
                          width: `${item.porcentaje}%`,
                          background: i === 0 ? "orange" : "lightblue",
                        }}
                      ></div>
                    </div>
                    <span className={styles.percent}>
                      {item.porcentaje.toFixed(1)}%
                    </span>
                  </li>
                ))}
                {filterCompositionBySearch(compositionData).length === 0 && (
                  <p className={styles.noDataMessage}>
                    No hay materiales que coincidan con la búsqueda.
                  </p>
                )}
              </ul>
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.modalClose} onClick={closeModal}>
              &times;
            </button>
            <h2>{modalContent?.periodo || modalContent?.nombre}</h2>
            {modalContent?.detalle?.length > 0 ? (
              <ul>
                {modalContent.detalle.map((item: any, i: number) => (
                  <li key={i}>
                    {item.nombre}: {item.cantidad} unidades
                  </li>
                ))}
              </ul>
            ) : (
              <>
                {modalContent?.valor !== undefined && (
                  <p>
                    Valor Invertido: $
                    {modalContent.valor.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                )}
                {modalContent?.fecha && (
                  <p>Fecha/Período: {modalContent.fecha}</p>
                )}
                {modalContent?.porcentaje !== undefined && (
                  <p>
                    Porcentaje del total: {modalContent.porcentaje.toFixed(1)}%
                  </p>
                )}
                {modalContent?.cantidad !== undefined && (
                  <p>Cantidad Total: {modalContent.cantidad}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}