import { useEffect, useState, useRef, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  Users,
  Plus,
  Search,
  Upload,
  Trash2,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Tag,
  Loader2,
  UserPlus,
} from "lucide-react";
import clsx from "clsx";
import api from "../lib/api";
import type {
  Contact,
  CreateContactPayload,
  UpdateContactPayload,
  PaginatedContacts,
  ApiError,
} from "../types";

// ─── Types ─────────────────────────────────────────────────────
interface ContactFormValues {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

interface ContactModalProps {
  contact: Contact | null;
  onClose: () => void;
  onSaved: () => void;
}

// ─── Modal Tambah / Edit ───────────────────────────────────────
function ContactModal({ contact, onClose, onSaved }: ContactModalProps) {
  const isEdit = contact !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    defaultValues: isEdit
      ? {
          name: contact.name,
          phone: contact.phone ?? "",
          email: contact.email ?? "",
          notes: contact.notes ?? "",
        }
      : {},
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      if (isEdit) {
        const payload: UpdateContactPayload = { ...data };
        await api.put(`/contacts/${contact.id}`, payload);
        toast.success("Kontak diperbarui");
      } else {
        const payload: CreateContactPayload = { ...data };
        await api.post("/contacts", payload);
        toast.success("Kontak ditambahkan");
      }
      onSaved();
      onClose();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      toast.error(axiosErr.response?.data?.message ?? "Gagal menyimpan kontak");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-text-primary font-semibold">
            {isEdit ? "Edit Kontak" : "Tambah Kontak"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">
              Nama <span className="text-danger">*</span>
            </label>
            <input
              className="input"
              placeholder="Nama kontak"
              {...register("name", { required: "Nama wajib diisi" })}
            />
            {errors.name && (
              <p className="text-danger text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">
              Nomor WhatsApp
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                className="input pl-10 font-mono"
                placeholder="628xxxxxxxxxx"
                {...register("phone")}
              />
            </div>
            <p className="text-text-muted text-xs mt-1">
              Format: 628xxx (tanpa + atau 0)
            </p>
          </div>

          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                className="input pl-10"
                type="email"
                placeholder="email@contoh.com"
                {...register("email")}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">
              Catatan
            </label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Catatan opsional..."
              {...register("notes")}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEdit ? (
                "Simpan"
              ) : (
                "Tambah"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
type ModalState = "add" | Contact | null;

const LIMIT = 50;

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<ModalState>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Fetch ─────────────────────────────────────────────────
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedContacts>("/contacts", {
        params: { page, limit: LIMIT, search: search || undefined },
      });
      setContacts(data.contacts);
      setTotal(data.total);
    } catch {
      toast.error("Gagal memuat kontak");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, search]);

  // ─── Search ────────────────────────────────────────────────
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // ─── Select ────────────────────────────────────────────────
  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === contacts.length) setSelected(new Set());
    else setSelected(new Set(contacts.map((c) => c.id)));
  };

  // ─── Delete ────────────────────────────────────────────────
  const handleDelete = async (ids: number[]) => {
    if (
      !window.confirm(
        `Hapus ${ids.length} kontak? Tindakan ini tidak bisa dibatalkan.`,
      )
    )
      return;
    try {
      await api.delete("/contacts", { data: { ids } });
      toast.success(`${ids.length} kontak dihapus`);
      setSelected(new Set());
      fetchContacts();
    } catch {
      toast.error("Gagal menghapus kontak");
    }
  };

  // ─── Import CSV ────────────────────────────────────────────
  const handleImportCSV = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post<{
        message: string;
        imported: number;
        skipped: number;
      }>("/contacts/import/csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(data.message);
      fetchContacts();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      toast.error(axiosErr.response?.data?.message ?? "Import gagal");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" /> Kontak
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {total.toLocaleString()} kontak terdaftar
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {selected.size > 0 && (
            <button
              onClick={() => handleDelete([...selected])}
              className="btn-danger flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" /> Hapus ({selected.size})
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportCSV}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Import CSV
          </button>

          <button
            onClick={() => setModal("add")}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Kontak
          </button>
        </div>
      </div>

      {/* CSV hint */}
      <div className="bg-info/5 border border-info/20 rounded-lg px-4 py-3 text-info text-sm mb-4 flex items-start gap-2">
        <Tag className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          Format CSV: kolom{" "}
          <code className="font-mono bg-info/10 px-1 rounded">name</code>,{" "}
          <code className="font-mono bg-info/10 px-1 rounded">phone</code>,{" "}
          <code className="font-mono bg-info/10 px-1 rounded">email</code> —
          header di baris pertama.
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          className="input pl-10"
          placeholder="Cari nama, nomor, atau email..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border bg-bg-surface">
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={
                      selected.size === contacts.length && contacts.length > 0
                    }
                    onChange={toggleAll}
                    className="rounded border-bg-border bg-bg-surface accent-accent cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-text-muted font-medium">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-text-muted font-medium">
                  WhatsApp
                </th>
                <th className="px-4 py-3 text-left text-text-muted font-medium">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-text-muted font-medium">
                  Catatan
                </th>
                <th className="px-4 py-3 text-right text-text-muted font-medium">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Memuat kontak...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-muted">
                    <UserPlus className="w-10 h-10 mx-auto mb-3 text-text-muted/30" />
                    {search
                      ? "Tidak ada hasil pencarian"
                      : "Belum ada kontak. Tambah atau import CSV!"}
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr
                    key={c.id}
                    className={clsx(
                      "border-b border-bg-border/50 hover:bg-bg-surface/50 transition-colors",
                      selected.has(c.id) && "bg-accent/5",
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="rounded border-bg-border bg-bg-surface accent-accent cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-accent text-xs font-bold">
                            {c.name[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-text-primary font-medium">
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                      {c.phone ?? "–"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {c.email ?? "–"}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs max-w-[180px] truncate">
                      {c.notes ?? "–"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModal(c)}
                          className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete([c.id])}
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-bg-border">
            <p className="text-text-muted text-sm">
              Menampilkan {(page - 1) * LIMIT + 1}–
              {Math.min(page * LIMIT, total)} dari {total.toLocaleString()}
            </p>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="btn-ghost p-2 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-text-secondary text-sm px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="btn-ghost p-2 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal !== null && (
        <ContactModal
          contact={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchContacts}
        />
      )}
    </div>
  );
}
