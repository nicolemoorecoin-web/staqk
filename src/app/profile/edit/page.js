"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCamera, FiChevronRight } from "react-icons/fi";
import { HiUserCircle } from "react-icons/hi";
import { useAppPrefs } from "../../components/AppPrefsProvider"; // adjust if your path differs

/* ---- local l10n fallback (works even if AppPrefs is missing keys) ---- */
const PAGE_L10N = {
  en: {
    editProfile: "Edit Profile",
    privateInfo: "Private Information",
    name: "Name",
    username: "Username",
    staqksId: "STAQKS ID",
    email: "Email",
    phone: "Phone",
    birthdate: "Birthdate",
    gender: "Gender",
    weight: "Weight",
    height: "Height",
    address: "Address",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading…",
    failed: "Failed to load profile",
    changePhoto: "Change photo",
    done: "Done",
    male: "Male",
    female: "Female",
    other: "Other",
    mark: "—",
  },
  fr: {
    editProfile: "Modifier le profil",
    privateInfo: "Informations privées",
    name: "Nom",
    username: "Nom d’utilisateur",
    staqksId: "ID STAQKS",
    email: "E-mail",
    phone: "Téléphone",
    birthdate: "Date de naissance",
    gender: "Sexe",
    weight: "Poids",
    height: "Taille",
    address: "Adresse",
    save: "Enregistrer",
    cancel: "Annuler",
    loading: "Chargement…",
    failed: "Impossible de charger le profil",
    changePhoto: "Changer la photo",
    done: "Terminé",
    male: "Homme",
    female: "Femme",
    other: "Autre",
    mark: "—",
  },
  es: {
    editProfile: "Editar perfil",
    privateInfo: "Información privada",
    name: "Nombre",
    username: "Usuario",
    staqksId: "ID STAQKS",
    email: "Correo",
    phone: "Teléfono",
    birthdate: "Fecha de nacimiento",
    gender: "Género",
    weight: "Peso",
    height: "Altura",
    address: "Dirección",
    save: "Guardar",
    cancel: "Cancelar",
    loading: "Cargando…",
    failed: "No se pudo cargar el perfil",
    changePhoto: "Cambiar foto",
    done: "Listo",
    male: "Hombre",
    female: "Mujer",
    other: "Otro",
    mark: "—",
  },
  de: {
    editProfile: "Profil bearbeiten",
    privateInfo: "Private Informationen",
    name: "Name",
    username: "Benutzername",
    staqksId: "STAQKS-ID",
    email: "E-Mail",
    phone: "Telefon",
    birthdate: "Geburtsdatum",
    gender: "Geschlecht",
    weight: "Gewicht",
    height: "Größe",
    address: "Adresse",
    save: "Speichern",
    cancel: "Abbrechen",
    loading: "Lädt…",
    failed: "Profil konnte nicht geladen werden",
    changePhoto: "Foto ändern",
    done: "Fertig",
    male: "Männlich",
    female: "Weiblich",
    other: "Andere",
    mark: "—",
  },
  ar: {
    editProfile: "تعديل الملف الشخصي",
    privateInfo: "معلومات خاصة",
    name: "الاسم",
    username: "اسم المستخدم",
    staqksId: "معرّف STAQKS",
    email: "البريد",
    phone: "الهاتف",
    birthdate: "تاريخ الميلاد",
    gender: "الجنس",
    weight: "الوزن",
    height: "الطول",
    address: "العنوان",
    save: "حفظ",
    cancel: "إلغاء",
    loading: "جارٍ التحميل…",
    failed: "تعذّر تحميل الملف الشخصي",
    changePhoto: "تغيير الصورة",
    done: "تم",
    male: "ذكر",
    female: "أنثى",
    other: "آخر",
    mark: "—",
  },
  zh: {
    editProfile: "编辑资料",
    privateInfo: "隐私信息",
    name: "姓名",
    username: "用户名",
    staqksId: "STAQKS ID",
    email: "邮箱",
    phone: "电话",
    birthdate: "出生日期",
    gender: "性别",
    weight: "体重",
    height: "身高",
    address: "地址",
    save: "保存",
    cancel: "取消",
    loading: "加载中…",
    failed: "无法加载资料",
    changePhoto: "更换头像",
    done: "完成",
    male: "男",
    female: "女",
    other: "其他",
    mark: "—",
  },
};

function pickLang(code) {
  const k = String(code || "en").toLowerCase();
  return PAGE_L10N[k] ? k : "en";
}
function langToLocale(lang) {
  if (lang === "fr") return "fr-FR";
  if (lang === "es") return "es-ES";
  if (lang === "de") return "de-DE";
  if (lang === "ar") return "ar";
  if (lang === "zh") return "zh-CN";
  return "en-US";
}

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // AppPrefs (if present)
  const prefs = useAppPrefs?.() || {};
  const appT = typeof prefs.t === "function" ? prefs.t : null;
  const appLang = prefs?.lang || prefs?.language || "en";

  const lang = pickLang(appLang);
  const locale = langToLocale(lang);

  const tr = (key) => {
    const viaApp = appT ? appT(key) : null;
    if (viaApp && viaApp !== key) return viaApp; // if AppPrefs knows the key, use it
    return PAGE_L10N[lang]?.[key] || PAGE_L10N.en[key] || key;
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(null);

  // editable fields
  const [draft, setDraft] = useState({
    username: "",
    phone: "",
    birthdate: "", // YYYY-MM-DD
    gender: "",
    weight: "",
    height: "",
    address: "",
    avatar: null,
  });

  // modal editor
  const [editKey, setEditKey] = useState(null);

  useEffect(() => {
    (async () => {
      setError("");
      setLoading(true);
      try {
        const r = await fetch("/api/me/profile", { cache: "no-store" });
        if (r.status === 401) {
          router.replace("/login?next=/profile/edit");
          return;
        }
        const j = await r.json().catch(() => ({}));
        if (!r.ok || j?.ok === false) throw new Error(j?.error || tr("failed"));

        const p = j.profile;
        setProfile(p);

        setDraft({
          username: p?.username || "",
          phone: p?.phone || "",
          birthdate: p?.birthdate ? toYmd(p.birthdate) : "",
          gender: p?.gender || "",
          weight: p?.weight || "",
          height: p?.height || "",
          address: p?.address || "",
          avatar: p?.avatar || null,
        });
      } catch (e) {
        setError(e?.message || tr("failed"));
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const displayBirthdate = useMemo(() => {
    if (!draft.birthdate) return tr("mark");
    const d = new Date(draft.birthdate);
    if (Number.isNaN(d.getTime())) return tr("mark");
    return d.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });
  }, [draft.birthdate, locale, lang]);

  async function saveAll() {
    setError("");
    setSaving(true);
    try {
      const r = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          username: draft.username,
          phone: draft.phone,
          birthdate: draft.birthdate || null,
          gender: draft.gender,
          weight: draft.weight,
          height: draft.height,
          address: draft.address,
          avatar: draft.avatar,
        }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok || j?.ok === false) throw new Error(j?.error || "Save failed");

      setProfile(j.profile);
      setEditKey(null);
      router.back();
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 6 * 1024 * 1024) {
      setError("Max avatar size is 6MB.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setDraft((d) => ({ ...d, avatar: dataUrl }));
  }

  return (
    <main className="min-h-[100dvh] bg-[#0b0f1a] text-white">
      {/* Page header (kept slim so it doesn't fight your app's top header) */}
      <div className="sticky top-0 z-20 bg-[#0b0f1a]/85 backdrop-blur border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-300 hover:text-white" aria-label="Back">
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold">{tr("editProfile")}</h1>
        </div>
      </div>

      {/* IMPORTANT: padding bottom so your bottom nav won't cover buttons */}
      <div className="max-w-md mx-auto px-4 pt-4 pb-32">
        {error ? (
          <div className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        {/* Avatar */}
        <div className="flex flex-col items-center py-5">
          <div className="relative">
            {draft.avatar ? (
              <img
                src={draft.avatar}
                alt="avatar"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-white/10"
              />
            ) : (
              <HiUserCircle className="h-20 w-20 text-white/25" />
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-white/10 border border-white/15 grid place-items-center hover:bg-white/15"
              aria-label={tr("changePhoto")}
              title={tr("changePhoto")}
            >
              <FiCamera className="text-white" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarPick}
            />
          </div>
        </div>

        {/* Basic */}
        <IOSCard>
          <IOSRow label={tr("name")} value={profile?.name || tr("mark")} readOnly />
          <IOSRow
            label={tr("username")}
            value={draft.username || tr("mark")}
            onClick={() => setEditKey("username")}
          />
          <IOSRow label={tr("staqksId")} value={profile?.staqksId || tr("mark")} readOnly noBorder />
        </IOSCard>

        <div className="text-white/65 text-sm font-semibold mt-6 mb-2">
          {tr("privateInfo")}
        </div>

        <IOSCard>
          <IOSRow label={tr("email")} value={profile?.email || tr("mark")} readOnly />
          <IOSRow label={tr("phone")} value={draft.phone || tr("mark")} onClick={() => setEditKey("phone")} />
          <IOSRow label={tr("birthdate")} value={displayBirthdate} onClick={() => setEditKey("birthdate")} />
          <IOSRow label={tr("gender")} value={draft.gender || tr("mark")} onClick={() => setEditKey("gender")} />
          <IOSRow label={tr("weight")} value={draft.weight || tr("mark")} onClick={() => setEditKey("weight")} />
          <IOSRow label={tr("height")} value={draft.height || tr("mark")} onClick={() => setEditKey("height")} />
          <IOSRow
            label={tr("address")}
            value={draft.address ? truncate(draft.address, 26) : tr("mark")}
            onClick={() => setEditKey("address")}
            noBorder
          />
        </IOSCard>

        {/* Save/Cancel (NOT fixed) so it will never hide behind your bottom nav */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 py-3 font-semibold"
          >
            {tr("cancel")}
          </button>

          <button
            type="button"
            onClick={saveAll}
            disabled={loading || saving}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 py-3 font-semibold"
          >
            {saving ? tr("loading") : tr("save")}
          </button>
        </div>

        {loading ? <div className="mt-4 text-white/50 text-sm">{tr("loading")}</div> : null}

        {/* Editor Modal */}
        {editKey && (
          <EditorModal
            title={modalTitle(editKey, tr)}
            value={draft?.[editKey] ?? ""}
            type={editKey === "birthdate" ? "date" : editKey === "phone" ? "tel" : "text"}
            options={editKey === "gender" ? [tr("male"), tr("female"), tr("other")] : null}
            multiline={editKey === "address"}
            onClose={() => setEditKey(null)}
            onSave={(val) => {
              setDraft((d) => ({ ...d, [editKey]: val }));
              setEditKey(null);
            }}
            tr={tr}
          />
        )}
      </div>
    </main>
  );
}

/* ---------- UI ---------- */
function IOSCard({ children }) {
  return (
    <div className="rounded-2xl bg-white/6 border border-white/10 overflow-hidden">
      {children}
    </div>
  );
}

function IOSRow({ label, value, onClick, readOnly, noBorder }) {
  const clickable = !!onClick && !readOnly;
  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      className={[
        "w-full text-left px-4 py-3 flex items-center justify-between gap-3",
        !noBorder ? "border-b border-white/8" : "",
        clickable ? "hover:bg-white/5" : "cursor-default",
      ].join(" ")}
      disabled={!clickable}
    >
      <span className="text-white/75 text-sm">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-white/90 text-sm truncate">{value}</span>
        {clickable ? <FiChevronRight className="text-white/35 shrink-0" /> : null}
      </div>
    </button>
  );
}

function EditorModal({ title, value, type, options, multiline, onClose, onSave, tr }) {
  const [v, setV] = useState(value || "");

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0f1628] border border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        {options ? (
          <select
            value={v}
            onChange={(e) => setV(e.target.value)}
            className="w-full rounded-xl bg-[#0b1020] border border-white/10 px-3 py-2 text-white"
          >
            <option value="">{tr("mark")}</option>
            {options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        ) : multiline ? (
          <textarea
            value={v}
            onChange={(e) => setV(e.target.value)}
            rows={4}
            className="w-full rounded-xl bg-[#0b1020] border border-white/10 px-3 py-2 text-white"
            placeholder={tr("mark")}
          />
        ) : (
          <input
            type={type || "text"}
            value={v}
            onChange={(e) => setV(e.target.value)}
            className="w-full rounded-xl bg-[#0b1020] border border-white/10 px-3 py-2 text-white"
            placeholder={tr("mark")}
          />
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSave(v)}
            className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 font-semibold"
          >
            {tr("save")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 py-2.5 font-semibold border border-white/10"
          >
            {tr("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function truncate(s, n) {
  const str = String(s || "");
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

function toYmd(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function modalTitle(k, tr) {
  return (
    k === "username" ? tr("username") :
    k === "phone" ? tr("phone") :
    k === "birthdate" ? tr("birthdate") :
    k === "gender" ? tr("gender") :
    k === "weight" ? tr("weight") :
    k === "height" ? tr("height") :
    k === "address" ? tr("address") :
    "Edit"
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}
