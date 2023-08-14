"use client";
import { useOrigin } from "@/hooks/useOrigin";
import { useParams } from "next/navigation";
import React from "react";
import { ApiAlert } from "./apiAlert";

export const ApiList = ({
  entityName,
  entityIdName,
}: {
  entityName: string;
  entityIdName: string;
}) => {
  const params = useParams();
  const origin = useOrigin();
  const baseURL = `${origin}/api/${params.storeId}`;
  return (
    <>
      <ApiAlert
        title="GET"
        desc={`${baseURL}/${entityName}`}
        variant={"public"}
      />
      <ApiAlert
        title="GET"
        desc={`${baseURL}/${entityName}/{${entityIdName}}`}
        variant={"public"}
      />
      <ApiAlert
        title="POST"
        desc={`${baseURL}/${entityName}`}
        variant={"admin"}
      />
      <ApiAlert
        title="PATCH"
        desc={`${baseURL}/${entityName}/{${entityIdName}}`}
        variant={"admin"}
      />
      <ApiAlert
        title="DELETE"
        desc={`${baseURL}/${entityName}/{${entityIdName}}`}
        variant={"admin"}
      />
    </>
  );
};
