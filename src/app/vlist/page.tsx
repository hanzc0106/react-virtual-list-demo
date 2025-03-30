"use client";
import { JSX, UIEvent, useCallback, useEffect, useRef, useState } from "react";
import VList from "@/component/VList";

export default function VListPage() {
  const listItems = Array(100)
    .fill(0)
    .map((_, index) => index + 1);

  const wrapStyle = {
    border: "1px solid #cc3",
    width: "300px",
    height: "400px",
    margin: "30px auto",
  } as const;

  const listStyle = {} as const;

  const itemStyle = {
    border: "1px solid #c3c",
    background: "#33c",
    color: "#3c3",
  } as const;

  return (
    <VList
      listItems={listItems}
      renderItem={(item) => <p>{item}</p>}
      getItemKey={(item) => item}
      wrapStyle={wrapStyle}
      listStyle={listStyle}
      itemStyle={itemStyle}
    />
  );
}
