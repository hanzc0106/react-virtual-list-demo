"use client";
import { JSX, UIEvent, useCallback, useEffect, useRef, useState } from "react";

export type Props<T> = {
  listItems: Array<T>;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T) => string | number;
  wrapHeight?: number;
  itemHeight?: number;
  buffSize?: number;
  wrapStyle?: React.CSSProperties;
  listStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
};

export default function Vlist<T>(props: Props<T>) {
  const {
    wrapHeight = 400,
    itemHeight = 50,
    buffSize = 2,
    wrapStyle = {},
    listStyle = {},
    itemStyle = {},
    listItems,
    renderItem,
    getItemKey,
  } = props;
  const itemCount = listItems.length;
  const totalHeight = itemCount * itemHeight;

  const [scrollTop, setScrollTop] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (wrapRef.current) {
      setScrollTop(wrapRef.current.scrollTop);
    }
  }, []);

  const mergedWrapStyle = {
    height: wrapHeight,
    overflowY: "scroll",
    ...wrapStyle,
  } as const;

  const mergedListStyle = {
    height: totalHeight,
    position: "relative",
    listStyleType: "none",
    ...listStyle,
  } as const;

  const mergedItemStyle = {
    position: "absolute",
    insetInline: 0,
    height: itemHeight,
    ...itemStyle,
  } as const;

  const getIndexOfItem = (item: T) => {
    return listItems.indexOf(item);
  };

  const renderItems = () => {
    const { startIndex, endIndex, renderStartIndex, renderEndIndex } =
      getIndexes(scrollTop);
    const renderItems = listItems.slice(renderStartIndex, renderEndIndex);
    return renderItems.map((item) => (
      <li
        key={getItemKey(item)}
        style={{ ...mergedItemStyle, top: itemHeight * getIndexOfItem(item) }}
      >
        {renderItem(item, getIndexOfItem(item))}
      </li>
    ));
  };

  const getIndexes = (scrollTop: number) => {
    console.log(scrollTop);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
    const endIndex = Math.min(
      itemCount,
      Math.ceil((scrollTop + wrapHeight) / itemHeight)
    );
    const renderStartIndex = Math.max(0, startIndex - buffSize);
    const renderEndIndex = Math.min(itemCount, endIndex + buffSize);

    return { startIndex, endIndex, renderStartIndex, renderEndIndex };
  };

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const scrollTop = (e.target as HTMLDivElement).scrollTop;
    setScrollTop(scrollTop);
  }, []);

  return (
    <div style={mergedWrapStyle} onScroll={handleScroll} ref={wrapRef}>
      <ul style={mergedListStyle}>{renderItems()}</ul>
    </div>
  );
}
