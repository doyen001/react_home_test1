import { useEffect, useRef } from "react";

export const useRefScrollTo = (scrollProps: ScrollIntoViewOptions) => {
  const scrollToTop = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToTop.current && scrollToTop.current.scrollIntoView({ ...scrollProps });
  });

  return scrollToTop;
};
