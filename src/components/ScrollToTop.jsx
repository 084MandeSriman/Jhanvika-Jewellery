import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToTopImmediately } from "../utils/scroll";

export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  useLayoutEffect(() => {
    scrollToTopImmediately();
  }, [pathname, search]);
  return null;
}
