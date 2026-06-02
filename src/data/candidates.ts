export interface Candidate {
  id: string;
  name: string;
  email: string;
  password?: string;
  isAdmin?: boolean;
  lastLogin?: string;
}

export const DEFAULT_CANDIDATES: Candidate[] = [
  { id: "cand_01", name: "Tô Minh Tâm", email: "tominhtam@vccs.local" },
  { id: "cand_02", name: "Đặng Chí Thanh", email: "dangchithanh@vccs.local" },
  { id: "cand_03", name: "Phan Trọng Nhân", email: "phantrongnhan@vccs.local" },
  { id: "cand_04", name: "Nhâm Mạnh Đạt", email: "nhammanhdat@vccs.local" },
  { id: "cand_05", name: "Nguyễn Tá Đại Phước", email: "nguyentadaiphuoc@vccs.local" },
  { id: "cand_06", name: "Nguyễn Chí Thanh", email: "nguyenchithanh@vccs.local" },
  { id: "cand_07", name: "Đỗ Xuân Trường", email: "doxuantruong@vccs.local" },
  { id: "cand_08", name: "Phan Huy Long", email: "phanhuylong@vccs.local" },
  { id: "cand_09", name: "Nguyễn Trung Vĩnh", email: "nguyentrungvinh@vccs.local" },
  { id: "cand_10", name: "Lê Thị Hương Nhân", email: "lethihuongnhan@vccs.local" },
  { id: "cand_11", name: "Lê Hoàng Đức", email: "lehoangduc@vccs.local" },
  { id: "cand_12", name: "Phạm Thị Hồng Thắm", email: "phamthihongtham@vccs.local" },
  { id: "cand_13", name: "Ngô Vi Ngoán", email: "ngovingoan@vccs.local" },
  { id: "cand_14", name: "Trần Văn Trường", email: "tranvantruong@vccs.local", password: "Mk07720891", isAdmin: true }
];

export const DEFAULT_CANDIDATE_PASSWORD = "tbtt@2026";
