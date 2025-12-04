import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation(); // lấy đường dẫn hiện tại

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // scroll lên đầu trang
  }, [pathname]); // chạy khi URL thay đổi

  return null; // không render gì cả
}
