import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { ReactNode } from "react";

type ParallelTabPropsType = {
  tabListClassName: string;
  tabClassName: string;
  tabContent: ReactNode[];
  panelContent: ReactNode[];
};

export default function ParallelTab({
  tabListClassName,
  tabClassName,
  tabContent,
  panelContent,
}: ParallelTabPropsType) {
  return (
    <TabGroup className="flex">
      <TabList className={`p-3 ${tabListClassName}`}>
        {tabContent.map((tab, index) => {
          return (
            <Tab
              key={`tab${index}`}
              className={`me-3 focus-visible:outline-0 ${tabClassName}`}
            >
              {tab}
            </Tab>
          );
        })}
      </TabList>
      <TabPanels className="p-3">
        {panelContent.map((panel, index) => {
          return <TabPanel key={`panel${index}`}>{panel}</TabPanel>;
        })}
      </TabPanels>
    </TabGroup>
  );
}
