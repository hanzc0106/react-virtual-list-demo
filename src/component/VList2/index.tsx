"use client";
import {
  UIEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useContext,
  useMemo,
} from "react";

import { ItemOffsetContext, ItemOffsetProvider } from "./ItemOffsetContext";
import { produce } from "immer";

export type Props<T extends { height: number }> = {
  listItems: Array<T>;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T) => string | number;
  wrapHeight?: number;
  estimateItemHeight?: number;
  buffSize?: number;
  wrapStyle?: React.CSSProperties;
  listStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
};

export function VList2<T extends { height: number }>(props: Props<T>) {
  const {
    wrapHeight = 400,
    estimateItemHeight = 50,
    buffSize = 2,
    wrapStyle = {},
    listStyle = {},
    itemStyle = {},
    listItems,
    renderItem,
    getItemKey,
  } = props;
  const itemCount = listItems.length;

  const [itemOffsetList, setItemOffsetList] = useState<
    Array<[number, number, number]>
  >([]);

  useEffect(() => {
    const itemOffsetList: Array<[number, number, number]> = [];
    let offset = 0;
    for (let i = 0; i < itemCount; i++) {
      const start = offset;
      const end = offset + estimateItemHeight;
      itemOffsetList.push([start, estimateItemHeight, end]);
      offset = end;
    }
    setItemOffsetList(itemOffsetList);
  }, []);

  const totalHeight = useMemo(() => {
    return itemOffsetList.reduce((acc, item) => acc + item[1], 0);
  }, [itemOffsetList]);

  const onSizeChange = (index: number, height: number) => {
    setItemOffsetList((prev) =>
      produce(prev, (draft) => {
        const start = draft[index][0];
        draft[index][1] = height;
        draft[index][2] = start + height;

        let offset = start + height;
        for (let i = index + 1; i < draft.length; i++) {
          const _height = draft[i][1];
          const newStart = offset;
          const newEnd = offset + _height;
          draft[i][0] = newStart;
          draft[i][2] = newEnd;
          offset = newEnd;
        }
      })
    );
  };

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
    ...itemStyle,
  } as const;

  const renderItems = () => {
    if (itemOffsetList.length === 0) {
      return null;
    }
    const { startIndex, endIndex, renderStartIndex, renderEndIndex } =
      getIndexes();
    const renderItems = listItems.slice(renderStartIndex, renderEndIndex + 1);
    const partItemOffsetList = itemOffsetList.slice(
      renderStartIndex,
      renderEndIndex + 1
    );

    return renderItems.map((item, index) => (
      <VListItem
        key={getItemKey(item)}
        index={renderStartIndex + index}
        style={{
          ...mergedItemStyle,
          top: partItemOffsetList[index][0],
        }}
      >
        {renderItem(item, renderStartIndex + index)}
      </VListItem>
    ));
  };

  const getStartIndex = () => {
    for (let i = 0; i < itemOffsetList.length; i++) {
      const [start, height, end] = itemOffsetList[i];
      if (scrollTop >= start && scrollTop < end) {
        return i;
      }
    }
    return 0;
  };

  const getEndIndex = (startIndex: number) => {
    for (let i = startIndex; i < itemOffsetList.length; i++) {
      const [start, height, end] = itemOffsetList[i];
      if (scrollTop + wrapHeight > start && scrollTop + wrapHeight <= end) {
        return i;
      }
      if (scrollTop + wrapHeight >= totalHeight)
        return itemOffsetList.length - 1;
    }
    return 0;
  };

  const getIndexes = () => {
    const startIndex = getStartIndex();
    const endIndex = getEndIndex(startIndex);
    const renderStartIndex = Math.max(0, startIndex - buffSize);
    const renderEndIndex = Math.min(itemCount - 1, endIndex + buffSize);
    return { startIndex, endIndex, renderStartIndex, renderEndIndex };
  };

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const scrollTop = (e.target as HTMLDivElement).scrollTop;
    setScrollTop(scrollTop);
  }, []);

  return (
    <ItemOffsetProvider
      value={{
        itemOffsetList: itemOffsetList,
        onSizeChange,
      }}
    >
      <div style={mergedWrapStyle} onScroll={handleScroll} ref={wrapRef}>
        <ul style={mergedListStyle}>{renderItems()}</ul>
      </div>
    </ItemOffsetProvider>
  );
}

export type ItemProps = {
  children: React.ReactNode;
  index: number;
  style?: React.CSSProperties;
};

export function VListItem({ children, index, style = {} }: ItemProps) {
  const { itemsHeightList, onSizeChange } = useContext(ItemOffsetContext);
  const liRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === liRef.current) {
          const height = entry.borderBoxSize[0].blockSize;
          onSizeChange(index, height);
        }
      }
    });

    const liDom = liRef.current;
    if (liDom) {
      resizeObserver.observe(liDom);
    }

    return () => {
      if (liDom) resizeObserver.unobserve(liDom);
    };
  }, [liRef.current]);

  const mergedStyle = {
    ...style,
  };
  return (
    <li ref={liRef} style={mergedStyle}>
      {children}
    </li>
  );
}
