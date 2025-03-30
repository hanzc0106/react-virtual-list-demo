"use client";
import { JSX, UIEvent, useCallback, useEffect, useRef, useState } from "react";
import VList1 from "@/component/VList1";

export default function VListPage() {
  const listItems = Array(100)
    .fill(0)
    .map((_, index) => ({
      height: 20 + Math.floor(60 * Math.random()),
      value: index + 1,
    }));

  const wrapStyle = {
    border: "1px solid #cc3",
    width: "300px",
    margin: "30px auto",
  } as const;

  const listStyle = {} as const;

  const itemStyle = {
    border: "1px solid #c3c",
    background: "#33c",
    color: "#3c3",
  } as const;

  return (
    <VList1
      listItems={listItems}
      renderItem={(item) => <p>{item.value}</p>}
      getItemKey={(item) => item.value}
      wrapStyle={wrapStyle}
      listStyle={listStyle}
      itemStyle={itemStyle}
    />
  );
}
