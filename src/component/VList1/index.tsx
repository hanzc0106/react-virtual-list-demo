"use client";
import {
  JSX,
  UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Props<T extends { height: number }> = {
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

export default function VList1<T extends { height: number }>(props: Props<T>) {
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
  const totalHeight = listItems.reduce((acc, item) => acc + item.height, 0);

  const itemsHeightList = useMemo(() => {
    const itemsHeightList: Array<[number, number]> = [];
    let offset = 0;
    for (let i = 0; i < listItems.length; i++) {
      const start = offset;
      const end = offset + listItems[i].height;
      itemsHeightList.push([start, end]);
      offset = end;
    }
    return itemsHeightList;
  }, [listItems]);
  const itemsHeightListRef = useRef(itemsHeightList);

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

  const renderItems = () => {
    const { startIndex, endIndex, renderStartIndex, renderEndIndex } =
      getIndexes();
    const renderItems = listItems.slice(renderStartIndex, renderEndIndex);
    const itemsHeightList = itemsHeightListRef.current.slice(
      renderStartIndex,
      renderEndIndex
    );
    return renderItems.map((item, index) => (
      <li
        key={getItemKey(item)}
        style={{
          ...mergedItemStyle,
          height: item.height,
          top: itemsHeightList[index][0],
        }}
      >
        {renderItem(item, renderStartIndex + index)}
      </li>
    ));
  };

  const getStartIndex = () => {
    if (itemsHeightListRef.current.length === 0) {
      return 0;
    }
    if (scrollTop < 0) {
      return 0;
    }
    if (scrollTop >= totalHeight) {
      return itemCount - 1;
    }
    for (let i = 0; i < itemsHeightListRef.current.length; i++) {
      const [start, end] = itemsHeightListRef.current[i];
      if (scrollTop >= start && scrollTop < end) {
        return i;
      }
    }
    throw new Error("startIndex not found");
  };

  const getEndIndex = (scrollTop: number) => {
    if (itemsHeightListRef.current.length === 0) {
      return 0;
    }
    if (scrollTop + wrapHeight < 0) {
      return 0;
    }
    if (scrollTop + wrapHeight >= totalHeight) {
      return itemCount - 1;
    }
    for (let i = 0; i < itemsHeightListRef.current.length; i++) {
      const [start, end] = itemsHeightListRef.current[i];
      if (scrollTop + wrapHeight > start && scrollTop + wrapHeight <= end) {
        return i;
      }
    }
    throw new Error("endIndex not found");
  };

  const getIndexes = () => {
    const startIndex = getStartIndex();
    const endIndex = getEndIndex(scrollTop);
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
