import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Icon from "@/components/ui/icon";

const queryClient = new QueryClient();

// ─── Types ────────────────────────────────────────────────────────────────────

type Page = "home" | "warehouses" | "warehouse" | "my-cells" | "contacts" | "auth" | "profile" | "access";
type CellStatus = "free" | "reserved" | "occupied" | "inactive";
type BookingStatus = "pending" | "reserved" | "paid" | "cancelled" | "expired";

interface Cell {
  id: string;
  name: string;
  size_m3: number;
  width_cm: number;
  height_cm: number;
  depth_cm: number;
  price_month: number;
  status: CellStatus;
  description: string;
}

interface Warehouse {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  description: string;
  photo_url: string;
  cells: Cell[];
}

interface Booking {
  id: string;
  warehouse: Warehouse;
  cell: Cell;
  status: BookingStatus;
  start_date: string;
  end_date: string;
  price_month: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const WAREHOUSES: Warehouse[] = [
  {
    id: "1",
    name: "Склад «Центральный»",
    slug: "centralnyy",
    address: "ул. Складская, 12",
    city: "Москва",
    description: "Современный склад в центре Москвы с круглосуточным доступом, видеонаблюдением и климат-контролем. Удобный подъезд для грузовых автомобилей.",
    photo_url: "https://cdn.poehali.dev/projects/e77280d5-a6c7-4eeb-a60e-a129f9a38ad2/files/fe3d1ae6-723a-49a4-8a63-aa90e879bc5c.jpg",
    cells: [
      { id: "c1", name: "А-01", size_m3: 0.6, width_cm: 60, height_cm: 100, depth_cm: 100, price_month: 1200, status: "free", description: "Мини-бокс для небольших вещей" },
      { id: "c2", name: "А-02", size_m3: 0.6, width_cm: 60, height_cm: 100, depth_cm: 100, price_month: 1200, status: "reserved", description: "Мини-бокс для небольших вещей" },
      { id: "c3", name: "Б-01", size_m3: 1, width_cm: 100, height_cm: 100, depth_cm: 100, price_month: 1800, status: "free", description: "Стандартный бокс" },
      { id: "c4", name: "Б-02", size_m3: 1, width_cm: 100, height_cm: 100, depth_cm: 100, price_month: 1800, status: "occupied", description: "Стандартный бокс" },
      { id: "c5", name: "В-01", size_m3: 1.5, width_cm: 150, height_cm: 100, depth_cm: 100, price_month: 2500, status: "free", description: "Увеличенный бокс" },
      { id: "c6", name: "В-02", size_m3: 1.5, width_cm: 150, height_cm: 100, depth_cm: 100, price_month: 2500, status: "free", description: "Увеличенный бокс" },
      { id: "c7", name: "Г-01", size_m3: 2, width_cm: 200, height_cm: 100, depth_cm: 100, price_month: 3200, status: "inactive", description: "Большой бокс" },
    ],
  },
  {
    id: "2",
    name: "Склад «Северный»",
    slug: "severnyy",
    address: "пр. Индустриальный, 48",
    city: "Москва",
    description: "Просторный склад на севере города. Охраняемая территория, электронные замки на каждой ячейке. Отличный выбор для бизнеса.",
    photo_url: "https://cdn.poehali.dev/projects/e77280d5-a6c7-4eeb-a60e-a129f9a38ad2/files/7e792f5b-0327-488c-a662-43c3a87c0ec7.jpg",
    cells: [
      { id: "c8", name: "А-01", size_m3: 0.6, width_cm: 60, height_cm: 100, depth_cm: 100, price_month: 900, status: "free", description: "Компактный бокс" },
      { id: "c9", name: "А-02", size_m3: 1, width_cm: 100, height_cm: 100, depth_cm: 100, price_month: 1500, status: "free", description: "Стандартный бокс" },
      { id: "c10", name: "Б-01", size_m3: 1, width_cm: 100, height_cm: 100, depth_cm: 100, price_month: 1500, status: "occupied", description: "Стандартный бокс" },
      { id: "c11", name: "Б-02", size_m3: 1.5, width_cm: 150, height_cm: 100, depth_cm: 100, price_month: 2200, status: "free", description: "Увеличенный бокс" },
      { id: "c12", name: "В-01", size_m3: 1.5, width_cm: 150, height_cm: 100, depth_cm: 100, price_month: 2200, status: "reserved", description: "Увеличенный бокс" },
      { id: "c13", name: "В-02", size_m3: 2, width_cm: 200, height_cm: 100, depth_cm: 100, price_month: 2800, status: "free", description: "Большой бокс" },
      { id: "c14", name: "Г-01", size_m3: 2, width_cm: 200, height_cm: 100, depth_cm: 100, price_month: 2800, status: "free", description: "Большой бокс" },
    ],
  },
];

const STATUS_LABELS: Record<CellStatus, string> = {
  free: "Свободно",
  reserved: "Зарезервировано",
  occupied: "Занято",
  inactive: "Неактивно",
};

const STATUS_CLASS: Record<CellStatus, string> = {
  free: "status-free",
  reserved: "status-reserved",
  occupied: "status-occupied",
  inactive: "status-inactive",
};

const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Ожидает",
  reserved: "Зарезервировано",
  paid: "Оплачено",
  cancelled: "Отменено",
  expired: "Истекло",
};

// ─── Helper Components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CellStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_CLASS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const cls: Record<BookingStatus, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    reserved: "bg-blue-100 text-blue-700 border-blue-200",
    paid: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-gray-100 text-gray-500 border-gray-200",
    expired: "bg-red-100 text-red-600 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls[status]}`}>
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({
  page,
  setPage,
  user,
}: {
  page: Page;
  setPage: (p: Page) => void;
  user: User | null;
}) {
  const navItems = [
    { id: "home" as Page, label: "Главная", icon: "Home" },
    { id: "warehouses" as Page, label: "Склады", icon: "Warehouse" },
    { id: "access" as Page, label: "Доступ", icon: "KeyRound" },
    { id: "my-cells" as Page, label: "Мои ячейки", icon: "Package" },
    { id: "contacts" as Page, label: "Контакты", icon: "Phone" },
  ];

  return (
    <>
      {/* Desktop top navbar */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border h-16 items-center px-6">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <button
            onClick={() => setPage("home")}
            className="flex items-center gap-2 font-bold text-xl text-primary"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Package" size={16} className="text-white" />
            </div>
            БериМесто
          </button>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === item.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => setPage(user ? "profile" : "auth")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              page === "profile" || page === "auth"
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-secondary text-foreground"
            }`}
          >
            <Icon name="User" size={16} />
            {user ? user.full_name.split(" ")[0] : "Войти"}
          </button>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border h-14 flex items-center px-4 justify-between">
        <button
          onClick={() => setPage("home")}
          className="flex items-center gap-1.5 font-bold text-lg text-primary"
        >
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <Icon name="Package" size={13} className="text-white" />
          </div>
          БериМесто
        </button>
        <button
          onClick={() => setPage(user ? "profile" : "auth")}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
        >
          <Icon name="User" size={16} className="text-foreground" />
        </button>
      </header>

      {/* Mobile bottom navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border safe-area-inset">
        <div className="flex items-stretch h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                page === item.id
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon name={item.icon} size={20} fallback="Circle" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

// ─── Page: Home ────────────────────────────────────────────────────────────────

function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  const totalFree = WAREHOUSES.flatMap((w) => w.cells).filter((c) => c.status === "free").length;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="min-h-[80vh] flex flex-col justify-center px-4 pt-20 pb-10">
        <div className="max-w-4xl mx-auto w-full text-center">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {totalFree} свободных ячеек прямо сейчас
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Храните вещи{" "}
            <span className="text-primary">без лишних</span>
            <br />
            хлопот
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Выберите ячейку подходящего размера, забронируйте онлайн и получите доступ в удобное время.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setPage("warehouses")}
              className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity shadow-sm"
            >
              Выбрать ячейку
            </button>
            <button
              onClick={() => setPage("contacts")}
              className="bg-secondary text-foreground px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-border transition-colors"
            >
              Связаться с нами
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "Shield", title: "Безопасность", desc: "Видеонаблюдение 24/7, охрана и электронные замки" },
            { icon: "Clock", title: "Доступ 24/7", desc: "Вы можете посетить свою ячейку в любое время" },
            { icon: "Zap", title: "Быстрое оформление", desc: "Бронирование онлайн за 2 минуты без бумаг" },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-border">
              <div className="w-11 h-11 bg-accent rounded-xl flex items-center justify-center mb-4">
                <Icon name={f.icon} size={22} className="text-primary" fallback="Star" />
              </div>
              <h3 className="font-semibold text-base mb-1.5">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Warehouses preview */}
      <section className="px-4 pb-20 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold">Наши склады</h2>
          <button
            onClick={() => setPage("warehouses")}
            className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
          >
            Все склады <Icon name="ArrowRight" size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WAREHOUSES.map((w) => (
            <WarehouseCard key={w.id} warehouse={w} setPage={setPage} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Warehouse Card ────────────────────────────────────────────────────────────

function WarehouseCard({
  warehouse,
  setPage,
  onSelect,
}: {
  warehouse: Warehouse;
  setPage: (p: Page) => void;
  onSelect?: (w: Warehouse) => void;
}) {
  const freeCount = warehouse.cells.filter((c) => c.status === "free").length;
  const minPrice = Math.min(...warehouse.cells.map((c) => c.price_month));

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-44 overflow-hidden">
        <img
          src={warehouse.photo_url}
          alt={warehouse.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${freeCount > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${freeCount > 0 ? "bg-green-500" : "bg-red-500"}`} />
            {freeCount > 0 ? `${freeCount} свободно` : "Нет мест"}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-base mb-1">{warehouse.name}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <Icon name="MapPin" size={13} />
          {warehouse.address}, {warehouse.city}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{warehouse.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            от <span className="text-foreground font-semibold text-base">{minPrice.toLocaleString("ru")} ₽</span>/мес
          </span>
          <button
            onClick={() => {
              if (onSelect) onSelect(warehouse);
              else setPage("warehouse");
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Смотреть ячейки
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page: Warehouses ──────────────────────────────────────────────────────────

function WarehousesPage({
  setPage,
  setSelectedWarehouse,
}: {
  setPage: (p: Page) => void;
  setSelectedWarehouse: (w: Warehouse) => void;
}) {
  return (
    <div className="px-4 pt-6 pb-24 max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-1">Склады</h1>
      <p className="text-muted-foreground text-sm mb-6">Выберите склад и посмотрите доступные ячейки</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WAREHOUSES.map((w) => (
          <WarehouseCard
            key={w.id}
            warehouse={w}
            setPage={setPage}
            onSelect={(warehouse) => {
              setSelectedWarehouse(warehouse);
              setPage("warehouse");
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Cell Card ─────────────────────────────────────────────────────────────────

function CellCard({
  cell,
  onBook,
}: {
  cell: Cell;
  onBook: (cell: Cell) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center shrink-0 text-primary font-bold text-sm">
        {cell.size_m3}м³
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{cell.name}</span>
          <StatusBadge status={cell.status} />
        </div>
        <div className="text-xs text-muted-foreground">
          {cell.width_cm}×{cell.depth_cm}×{cell.height_cm} см · {cell.description}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-semibold text-base">{cell.price_month.toLocaleString("ru")} ₽</div>
        <div className="text-xs text-muted-foreground mb-2">в месяц</div>
        <button
          disabled={cell.status !== "free"}
          onClick={() => onBook(cell)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            cell.status === "free"
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          }`}
        >
          {cell.status === "free" ? "Забронировать" : "Недоступно"}
        </button>
      </div>
    </div>
  );
}

// ─── Page: Warehouse Detail ────────────────────────────────────────────────────

function WarehousePage({
  warehouse,
  setPage,
  user,
  onBookingCreated,
}: {
  warehouse: Warehouse;
  setPage: (p: Page) => void;
  user: User | null;
  onBookingCreated: (booking: Booking) => void;
}) {
  const [bookedModal, setBookedModal] = useState<Cell | null>(null);
  const [cells, setCells] = useState<Cell[]>(warehouse.cells);

  const handleBook = (cell: Cell) => {
    if (!user) {
      setPage("auth");
      return;
    }
    setBookedModal(cell);
  };

  const confirmBook = () => {
    if (!bookedModal) return;
    setCells((prev) =>
      prev.map((c) => (c.id === bookedModal.id ? { ...c, status: "reserved" as CellStatus } : c))
    );
    const booking: Booking = {
      id: Date.now().toString(),
      warehouse,
      cell: { ...bookedModal, status: "reserved" },
      status: "reserved",
      start_date: new Date().toLocaleDateString("ru"),
      end_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString("ru"),
      price_month: bookedModal.price_month,
    };
    onBookingCreated(booking);
    setBookedModal(null);
    setPage("my-cells");
  };

  const freeCount = cells.filter((c) => c.status === "free").length;

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <div className="px-4 pt-4">
        <button
          onClick={() => setPage("warehouses")}
          className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors mb-4"
        >
          <Icon name="ArrowLeft" size={15} />
          Назад к складам
        </button>
      </div>

      {/* Photo */}
      <div className="relative h-52 md:h-72 overflow-hidden mx-4 rounded-2xl mb-6">
        <img
          src={warehouse.photo_url}
          alt={warehouse.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-xl font-bold">{warehouse.name}</h1>
          <div className="flex items-center gap-1 text-sm text-white/80">
            <Icon name="MapPin" size={13} />
            {warehouse.address}, {warehouse.city}
          </div>
        </div>
      </div>

      <div className="px-4 pb-24 max-w-3xl mx-auto">
        {/* Info */}
        <div className="bg-white rounded-xl border border-border p-4 mb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{warehouse.description}</p>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon name="Package" size={15} className="text-primary" />
              {warehouse.cells.length} ячеек всего
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-700 font-medium">{freeCount} свободно</span>
            </div>
          </div>
        </div>

        {/* Cells */}
        <h2 className="font-semibold text-base mb-3">Ячейки хранения</h2>
        <div className="space-y-2.5">
          {cells.map((cell) => (
            <CellCard key={cell.id} cell={cell} onBook={handleBook} />
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {bookedModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setBookedModal(null)}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in">
            <h3 className="font-bold text-lg mb-1">Подтвердите бронирование</h3>
            <p className="text-muted-foreground text-sm mb-5">Ячейка будет зарезервирована на ваше имя</p>

            <div className="bg-secondary rounded-xl p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Склад</span>
                <span className="font-medium">{warehouse.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ячейка</span>
                <span className="font-medium">{bookedModal.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Размер</span>
                <span className="font-medium">{bookedModal.size_m3} м³</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground">Стоимость</span>
                <span className="font-bold text-base">{bookedModal.price_month.toLocaleString("ru")} ₽/мес</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBookedModal(null)}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmBook}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Забронировать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page: My Cells ────────────────────────────────────────────────────────────

function MyCellsPage({
  user,
  bookings,
  setPage,
}: {
  user: User | null;
  bookings: Booking[];
  setPage: (p: Page) => void;
}) {
  const [doorModal, setDoorModal] = useState<Booking | null>(null);
  const [doorOpened, setDoorOpened] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
        <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4">
          <Icon name="Lock" size={28} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Требуется вход</h2>
        <p className="text-muted-foreground text-sm text-center mb-6">
          Войдите в аккаунт, чтобы увидеть свои бронирования
        </p>
        <button
          onClick={() => setPage("auth")}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Войти
        </button>
      </div>
    );
  }

  const handleOpenDoor = (booking: Booking) => {
    setDoorModal(booking);
    setDoorOpened(false);
  };

  const simulateOpen = () => {
    setTimeout(() => setDoorOpened(true), 1200);
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-1">Мои ячейки</h1>
      <p className="text-muted-foreground text-sm mb-6">Управляйте своими бронированиями</p>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="PackageOpen" size={24} className="text-muted-foreground" />
          </div>
          <p className="font-semibold mb-1">Нет активных бронирований</p>
          <p className="text-muted-foreground text-sm mb-5">Выберите склад и забронируйте ячейку</p>
          <button
            onClick={() => setPage("warehouses")}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90"
          >
            Выбрать склад
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{booking.warehouse.name}</p>
                  <p className="text-sm text-muted-foreground">{booking.warehouse.address}</p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Ячейка</div>
                  <div className="font-semibold text-sm">{booking.cell.name}</div>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Размер</div>
                  <div className="font-semibold text-sm">{booking.cell.size_m3} м³</div>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">В месяц</div>
                  <div className="font-semibold text-sm">{booking.price_month.toLocaleString("ru")} ₽</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Icon name="Calendar" size={13} />
                {booking.start_date} — {booking.end_date}
              </div>

              <div className="flex gap-2">
                {booking.status === "paid" ? (
                  <button
                    onClick={() => handleOpenDoor(booking)}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <Icon name="DoorOpen" size={15} />
                    Открыть дверь
                  </button>
                ) : (
                  <button className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                    Оплатить
                  </button>
                )}
                <button className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
                  Детали
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Door modal */}
      {doorModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setDoorModal(null)}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in text-center">
            {!doorOpened ? (
              <>
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon name="DoorClosed" size={28} className="text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-1">Открыть доступ</h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Ячейка {doorModal.cell.name} · {doorModal.warehouse.name}
                </p>
                <button
                  onClick={simulateOpen}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity mb-2"
                >
                  Открыть дверь
                </button>
                <button
                  onClick={() => setDoorModal(null)}
                  className="w-full py-3 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Закрыть
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={28} className="text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-1 text-green-700">Дверь открыта!</h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Доступ к ячейке {doorModal.cell.name} открыт. Не забудьте закрыть после использования.
                </p>
                <button
                  onClick={() => setDoorModal(null)}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  Готово
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page: Contacts ────────────────────────────────────────────────────────────

function ContactsPage() {
  return (
    <div className="px-4 pt-6 pb-24 max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-1">Контакты</h1>
      <p className="text-muted-foreground text-sm mb-6">Мы готовы ответить на ваши вопросы</p>

      <div className="space-y-4">
        {[
          { icon: "Phone", label: "Телефон", value: "+7 (495) 123-45-67", sub: "Пн–Вс, 8:00–22:00" },
          { icon: "Mail", label: "Email", value: "info@berymesto.ru", sub: "Ответим в течение часа" },
          { icon: "MapPin", label: "Офис", value: "Москва, ул. Складская, 12", sub: "Пн–Пт, 9:00–18:00" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-accent rounded-xl flex items-center justify-center shrink-0">
              <Icon name={c.icon} size={20} className="text-primary" fallback="Circle" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">{c.label}</div>
              <div className="font-semibold text-sm">{c.value}</div>
              <div className="text-xs text-muted-foreground">{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-border p-5">
        <h2 className="font-semibold mb-4">Написать нам</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Ваше имя"
            className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <input
            type="tel"
            placeholder="Телефон"
            className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <textarea
            rows={3}
            placeholder="Ваш вопрос..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
          <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page: Auth ────────────────────────────────────────────────────────────────

function AuthPage({
  setPage,
  onLogin,
}: {
  setPage: (p: Page) => void;
  onLogin: (user: User) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: "u1",
      full_name: name || "Иван Иванов",
      email: email || "ivan@example.com",
      phone: phone || "+7 (999) 123-45-67",
    });
    setPage("my-cells");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Package" size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">БериМесто</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === "login" ? "Войдите в аккаунт" : "Создайте аккаунт"}
          </p>
        </div>

        <div className="flex rounded-xl bg-secondary p-1 mb-6">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {m === "login" ? "Войти" : "Регистрация"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Полное имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          {mode === "register" && (
            <input
              type="tel"
              placeholder="Телефон"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          )}
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <button
            type="submit"
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity mt-2"
          >
            {mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </form>

        <button
          onClick={() => setPage("home")}
          className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
}

// ─── Page: Access ──────────────────────────────────────────────────────────────

function AccessPage({ setPage }: { setPage: (p: Page) => void }) {
  const [state, setState] = useState<"idle" | "opening" | "opened">("idle");
  const [pressed, setPressed] = useState(false);

  const handleOpen = () => {
    if (state !== "idle") return;
    setPressed(true);
    setState("opening");
    setTimeout(() => setState("opened"), 1800);
    setTimeout(() => {
      setState("idle");
      setPressed(false);
    }, 6000);
  };

  return (
    <div className="px-4 pt-8 pb-28 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Access</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-none mb-3">
          Доступ
        </h1>
        <p className="text-muted-foreground text-base max-w-md">
          Здесь отображается ваш текущий статус доступа и кнопка открытия двери.
        </p>
      </div>

      {/* Main access card */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-border shadow-sm mb-5">
        {/* Decorative gradient blob */}
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-gradient-to-tr from-primary/10 to-blue-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-7 md:p-10">
          {/* Status header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Icon name="ShieldCheck" size={22} className="text-white" fallback="Shield" />
                </div>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold leading-tight">Доступ активен</h2>
                <p className="text-sm text-muted-foreground">Вы можете открыть дверь</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>

          {/* Cell info row */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {[
              { label: "Склад", value: "Центральный", icon: "Warehouse" },
              { label: "Ячейка", value: "№11 · 1 м³", icon: "Box" },
              { label: "До", value: "11.07.2026", icon: "Calendar" },
            ].map((f) => (
              <div key={f.label} className="bg-secondary/40 rounded-2xl p-3 border border-border/50">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  <Icon name={f.icon} size={10} fallback="Circle" />
                  {f.label}
                </div>
                <p className="text-xs md:text-sm font-semibold truncate">{f.value}</p>
              </div>
            ))}
          </div>

          {/* THE BIG BUTTON */}
          <div className="flex flex-col items-center py-4">
            <div className="relative">
              {/* Pulse rings */}
              {state === "idle" && (
                <>
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "2.5s" }} />
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.7s" }} />
                </>
              )}

              <button
                onClick={handleOpen}
                disabled={state !== "idle"}
                className={`relative w-44 h-44 md:w-52 md:h-52 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-500 ${
                  state === "opened"
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/40"
                    : state === "opening"
                    ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl shadow-amber-500/40 scale-95"
                    : "bg-gradient-to-br from-primary to-indigo-700 hover:scale-105 shadow-2xl shadow-primary/40 cursor-pointer"
                } ${pressed && state === "opening" ? "scale-90" : ""}`}
              >
                {/* Inner ring */}
                <div className="absolute inset-3 rounded-full border-2 border-white/20" />

                {state === "idle" && (
                  <>
                    <Icon name="DoorClosed" size={48} className="text-white drop-shadow-lg" fallback="Lock" />
                    <span className="text-white font-bold text-base tracking-wide">Открыть дверь</span>
                  </>
                )}
                {state === "opening" && (
                  <>
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-white font-bold text-sm tracking-wide">Открываем...</span>
                  </>
                )}
                {state === "opened" && (
                  <>
                    <Icon name="DoorOpen" size={48} className="text-white drop-shadow-lg animate-scale-in" fallback="Check" />
                    <span className="text-white font-bold text-base tracking-wide animate-fade-in">Открыто!</span>
                  </>
                )}
              </button>
            </div>

            <p className={`mt-6 text-sm text-center max-w-xs transition-colors ${
              state === "opened" ? "text-emerald-700 font-semibold" : "text-muted-foreground"
            }`}>
              {state === "idle" && "Нажмите кнопку — дверь откроется в течение 2 секунд"}
              {state === "opening" && "Отправляем сигнал на замок..."}
              {state === "opened" && "✓ Дверь открыта. Не забудьте закрыть после использования"}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Help block */}
        <div className="relative p-6 md:p-7 bg-secondary/20">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center shrink-0">
              <Icon name="HelpCircle" size={16} className="text-primary" fallback="Info" />
            </div>
            <div>
              <p className="font-bold text-sm mb-1">Нужна помощь?</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <button onClick={() => setPage("profile")} className="text-primary font-semibold hover:underline">
                  Продлить аренду
                </button>{" "}
                можно в личном кабинете. Если доступ не активировался или возникли вопросы,{" "}
                <button onClick={() => setPage("contacts")} className="text-primary font-semibold hover:underline">
                  свяжитесь с нами
                </button>{" "}
                через страницу контактов.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-3xl border border-border p-6 md:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Icon name="History" size={18} className="text-blue-700" fallback="Clock" />
            </div>
            <h2 className="text-xl font-bold">История доступа</h2>
          </div>
          <span className="text-xs text-muted-foreground">Последние 3</span>
        </div>

        <div className="space-y-2">
          {[
            { date: "Сегодня, 14:32", action: "Открытие двери", status: "Успешно", icon: "DoorOpen", ok: true },
            { date: "Вчера, 19:08", action: "Открытие двери", status: "Успешно", icon: "DoorOpen", ok: true },
            { date: "10 мая, 11:24", action: "Активация доступа", status: "Подтверждено", icon: "ShieldCheck", ok: true },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3 bg-secondary/40 border border-border/50 rounded-2xl px-4 py-3 hover:bg-secondary/70 transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${row.ok ? "bg-emerald-100" : "bg-red-100"}`}>
                <Icon name={row.icon} size={15} className={row.ok ? "text-emerald-700" : "text-red-700"} fallback="Circle" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{row.action}</p>
                <p className="text-xs text-muted-foreground">{row.date}</p>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page: Profile ─────────────────────────────────────────────────────────────

function CountdownTimer({ target }: { target: Date }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return (
    <div className="flex items-center gap-1 font-mono tabular-nums">
      <span className="bg-amber-900 text-amber-50 px-2 py-1 rounded-md text-xs font-bold">{String(h).padStart(2, "0")}</span>
      <span className="text-amber-900 font-bold text-xs">:</span>
      <span className="bg-amber-900 text-amber-50 px-2 py-1 rounded-md text-xs font-bold">{String(m).padStart(2, "0")}</span>
      <span className="text-amber-900 font-bold text-xs">:</span>
      <span className="bg-amber-900 text-amber-50 px-2 py-1 rounded-md text-xs font-bold">{String(s).padStart(2, "0")}</span>
    </div>
  );
}

function ProfilePage({
  user,
  bookings,
  onLogout,
  setPage,
}: {
  user: User;
  bookings: Booking[];
  onLogout: () => void;
  setPage: (p: Page) => void;
}) {
  const rented = bookings.filter((b) => b.status === "paid");
  const reserved = bookings.filter((b) => b.status === "reserved" || b.status === "pending");

  const [agreedOffer, setAgreedOffer] = useState(false);
  const [agreedPersonal, setAgreedPersonal] = useState(false);
  const canPay = agreedOffer && agreedPersonal;

  const bookingDeadline = new Date(Date.now() + 2 * 3600 * 1000 + 13 * 60 * 1000);

  const totalMonthly = rented.reduce((sum, b) => sum + b.price_month, 0);
  void totalMonthly;

  const memo = [
    "Храните вещи аккуратно и не перекрывайте доступ к ячейке.",
    "Не передавайте доступ посторонним.",
    "Для продления аренды заранее свяжитесь с нами до даты окончания срока.",
    "Если возникли вопросы, используйте страницу контактов.",
  ];

  return (
    <div className="px-4 pt-8 pb-28 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Account</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-none">
            Личный кабинет
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Онлайн
        </div>
      </div>

      {/* 1. КОНТАКТНЫЕ ДАННЫЕ */}
      <section className="bg-white rounded-3xl border border-border p-6 md:p-7 mb-5 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Icon name="UserCircle2" size={20} className="text-primary" fallback="User" />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">Контактные данные</h2>
            <p className="text-xs text-muted-foreground">Эти данные используются для связи</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {[
            { label: "ФИО", value: user.full_name, icon: "User" },
            { label: "Телефон", value: user.phone, icon: "Phone" },
            { label: "Email", value: user.email, icon: "Mail" },
          ].map((f) => (
            <div key={f.label} className="bg-secondary/50 rounded-2xl p-4 border border-border/50">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
                <Icon name={f.icon} size={11} fallback="Circle" />
                {f.label}
              </div>
              <p className="text-sm font-semibold truncate">{f.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl px-4 py-3 text-xs">
          <Icon name="Info" size={14} className="shrink-0" />
          Контактные данные сохранены. Для изменений свяжитесь с нами.
        </div>
      </section>

      {/* 2. ДОСТУП АКТИВЕН */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border border-emerald-100 p-6 md:p-7 mb-5">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Icon name="KeyRound" size={22} className="text-white" fallback="Key" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950 leading-tight flex items-center gap-2">
                Доступ активен
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <p className="text-sm text-emerald-800/80 mt-0.5">Вы можете перейти на страницу доступа</p>
            </div>
          </div>
          <button
            onClick={() => setPage("my-cells")}
            className="hidden md:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            Открыть <Icon name="ArrowRight" size={14} />
          </button>
        </div>
      </section>

      {/* 3. БРОНЬ */}
      <section className="bg-white rounded-3xl border border-border p-6 md:p-7 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Icon name="Bookmark" size={18} className="text-amber-700" fallback="Star" />
            </div>
            <h2 className="text-xl font-bold">Бронь</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            К оплате
          </span>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 mb-5">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-amber-200/40 rounded-full blur-2xl" />
          <div className="relative">
            <p className="font-bold text-amber-950 text-base mb-1.5">Ячейка забронирована</p>
            <p className="text-sm text-amber-900/80 leading-relaxed">
              Бронь действует ещё <span className="font-semibold">2 часа 13 минут</span> — подтвердите условия и перейдите к оплате, чтобы завершить оформление брони.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <div className="bg-secondary/50 rounded-2xl p-4 border border-border/50">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Ячейка</p>
            <p className="text-sm font-semibold">На планете · Ячейка №5 · 1 м³</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] uppercase tracking-wider text-amber-800/70">Бронь действует до</p>
              <CountdownTimer target={bookingDeadline} />
            </div>
            <p className="text-sm font-bold text-amber-900">12.05.2026, 19:13:45</p>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 mb-5">
          <p className="text-sm font-semibold mb-3">Перед оплатой подтвердите</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedOffer}
                onChange={(e) => setAgreedOffer(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
              />
              <span className="text-sm group-hover:text-foreground transition-colors">
                Я принимаю условия <a className="text-primary underline underline-offset-2 font-medium">договора-оферты</a>
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedPersonal}
                onChange={(e) => setAgreedPersonal(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
              />
              <span className="text-sm group-hover:text-foreground transition-colors">
                Я согласен на <a className="text-primary underline underline-offset-2 font-medium">обработку персональных данных</a>
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            disabled={!canPay}
            className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              canPay
                ? "bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            }`}
          >
            <Icon name="CreditCard" size={16} />
            Оплатить ячейку
          </button>
          <button className="px-6 py-3.5 rounded-2xl border-2 border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
            <Icon name="X" size={16} />
            Отменить бронь
          </button>
        </div>
      </section>

      {/* 4. СТАТУС АРЕНДЫ */}
      <section className="bg-white rounded-3xl border border-border p-6 md:p-7 mb-5 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Icon name="PackageCheck" size={18} className="text-emerald-700" fallback="Package" />
          </div>
          <h2 className="text-xl font-bold">Статус аренды</h2>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 mb-4">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-emerald-800/70 mb-1">Срок аренды</p>
              <p className="font-bold text-2xl text-emerald-950 leading-tight mb-3">Аренда действует</p>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
                <Icon name="RefreshCw" size={14} />
                Продлить
              </button>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-white/80 backdrop-blur border border-emerald-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Активна
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-secondary/30 rounded-2xl p-4 border border-border/50 mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>11 мая</span>
            <span className="font-semibold text-foreground">осталось 60 дней</span>
            <span>11 июля</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" style={{ width: "15%" }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "Ячейка", value: "На планете · Ячейка №11 · 1 м³", icon: "Box" },
            { label: "Оплата", value: "Оплачено", icon: "CheckCircle2", accent: true },
            { label: "Дата начала", value: "2026-05-11", icon: "Calendar" },
            { label: "Дата окончания", value: "2026-07-11", icon: "CalendarClock" },
            { label: "Доступ", value: "Включен", icon: "Unlock", accent: true },
          ].map((f) => (
            <div key={f.label} className={`rounded-2xl p-4 border ${f.accent ? "bg-emerald-50 border-emerald-100" : "bg-secondary/50 border-border/50"}`}>
              <div className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wider mb-1.5 ${f.accent ? "text-emerald-800/70" : "text-muted-foreground"}`}>
                <Icon name={f.icon} size={11} fallback="Circle" />
                {f.label}
              </div>
              <p className={`text-sm font-semibold ${f.accent ? "text-emerald-900" : ""}`}>{f.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ПАМЯТКА */}
      <section className="bg-white rounded-3xl border border-border p-6 md:p-7 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Icon name="BookOpen" size={18} className="text-blue-700" fallback="Book" />
          </div>
          <h2 className="text-xl font-bold">Памятка</h2>
        </div>

        <div className="space-y-2">
          {memo.map((text, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-secondary/40 border border-border/50 rounded-2xl px-4 py-3.5 hover:bg-secondary/70 transition-colors"
            >
              <div className="w-6 h-6 shrink-0 rounded-lg bg-white border border-border flex items-center justify-center text-[11px] font-bold text-muted-foreground">
                {i + 1}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed pt-0.5">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-border bg-white text-muted-foreground text-sm font-medium hover:bg-secondary hover:text-foreground transition-colors"
      >
        <Icon name="LogOut" size={15} />
        Выйти
      </button>
    </div>
  );
}

// ─── App Root ──────────────────────────────────────────────────────────────────

function AppContent() {
  const [page, setPage] = useState<Page>("home");
  const [user, setUser] = useState<User | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse>(WAREHOUSES[0]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const handleLogin = (u: User) => setUser(u);
  const handleLogout = () => {
    setUser(null);
    setPage("home");
  };
  const handleBookingCreated = (b: Booking) => setBookings((prev) => [b, ...prev]);

  const paddingTop = page === "auth" ? "" : "pt-14 md:pt-16";

  return (
    <div className={`min-h-screen bg-background ${paddingTop}`}>
      {page !== "auth" && (
        <Navbar page={page} setPage={setPage} user={user} />
      )}

      {page === "home" && <HomePage setPage={setPage} />}
      {page === "warehouses" && (
        <WarehousesPage setPage={setPage} setSelectedWarehouse={setSelectedWarehouse} />
      )}
      {page === "warehouse" && (
        <WarehousePage
          warehouse={selectedWarehouse}
          setPage={setPage}
          user={user}
          onBookingCreated={handleBookingCreated}
        />
      )}
      {page === "my-cells" && (
        <MyCellsPage user={user} bookings={bookings} setPage={setPage} />
      )}
      {page === "access" && <AccessPage setPage={setPage} />}
      {page === "contacts" && <ContactsPage />}
      {page === "auth" && <AuthPage setPage={setPage} onLogin={handleLogin} />}
      {page === "profile" && user && (
        <ProfilePage
          user={user}
          bookings={bookings}
          onLogout={handleLogout}
          setPage={setPage}
        />
      )}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;