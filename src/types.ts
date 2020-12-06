export interface Alert {
  id: string; // UUID
  tinyId: string;
  message: string; // "Our servers are in danger"
  status: string; // TODO: enum
  acknowledged: boolean;
  isSeen: boolean;
  snoozed: boolean;
  tags: string[]; // ["Critical", "owner:some-team", "service:business-critical"]
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: string; // UUID
  tinyId: string;
  message: string; // "Our servers are in danger"
  status: string; // TODO: enum
  tags: string[]; // ["Critical", "owner:some-team", "service:business-critical"]
  priority: string; // TODO: enum
  createdAt: string;
  updatedAt: string;
}