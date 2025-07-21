'use client'

import { GroupType } from "@/lib/Types";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

const DatamodelDataContext = createContext<GroupType[]>([]);

export const DatamodelDataProvider = ({ children }: { children: ReactNode }) => {
  const [groups, setGroups] = useState<GroupType[]>([]);

  useEffect(() => {
    const worker = new Worker(new URL("../components/datamodelview/dataLoaderWorker.js", import.meta.url));
    worker.onmessage = (e) => {
      setGroups(e.data);
      worker.terminate();
    };
    worker.postMessage({});
    return () => worker.terminate();
  }, []);

  return (
    <DatamodelDataContext.Provider value={groups}>
      {children}
    </DatamodelDataContext.Provider>
  );
};

export const useDatamodelData = () => useContext(DatamodelDataContext); 