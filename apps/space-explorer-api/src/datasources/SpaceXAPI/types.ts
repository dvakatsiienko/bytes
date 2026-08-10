export interface Launch {
  auto_update: boolean;
  capsules: string[];
  cores: Core[];
  crew: unknown[];
  date_local: Date;
  date_precision: string;
  date_unix: number;
  date_utc: Date;
  details: string;
  failures: unknown[];
  fairings: null;
  flight_number: number;
  id: string;
  launchpad: string;
  links: Links;
  name: string;
  net: boolean;
  payloads: string[];
  rocket: string;
  ships: unknown[];
  static_fire_date_unix: number;
  static_fire_date_utc: Date;
  success: boolean;
  tdb: boolean;
  upcoming: boolean;
  window: number;
}

export interface Core {
  core: string;
  flight: number;
  gridfins: boolean;
  landing_attempt: boolean;
  landing_success: boolean;
  landing_type: string;
  landpad: string;
  legs: boolean;
  reused: boolean;
}

export interface Links {
  article: string;
  flickr: Flickr;
  patch: Patch | null;
  presskit: string;
  reddit: Reddit;
  webcast: string;
  wikipedia: string;
  youtube_id: string;
}

export interface Flickr {
  original: string[];
  small: unknown[];
}

export interface Patch {
  large: string | null;
  small: string | null;
}

export interface Reddit {
  campaign: string;
  launch: string;
  media: string;
  recovery: null;
}

export interface Rocket {
  active: boolean;
  boosters: number;
  company: string;
  cost_per_launch: number;
  country: string;
  description: string;
  diameter: Diameter;
  engines: Engines;
  first_flight: Date;
  first_stage: FirstStage;
  flickr_images: string[];
  height: Diameter;
  id: string;
  landing_legs: LandingLegs;
  mass: Mass;
  name: string;
  payload_weights: PayloadWeight[];
  second_stage: SecondStage;
  stages: number;
  success_rate_pct: number;
  type: string;
  wikipedia: string;
}

export interface Diameter {
  feet: number;
  meters: number;
}

export interface Engines {
  engine_loss_max: number;
  isp: ISP;
  layout: string;
  number: number;
  propellant_1: string;
  propellant_2: string;
  thrust_sea_level: Thrust;
  thrust_to_weight: number;
  thrust_vacuum: Thrust;
  type: string;
  version: string;
}

export interface ISP {
  sea_level: number;
  vacuum: number;
}

export interface Thrust {
  kN: number;
  lbf: number;
}

export interface FirstStage {
  burn_time_sec: number;
  engines: number;
  fuel_amount_tons: number;
  reusable: boolean;
  thrust_sea_level: Thrust;
  thrust_vacuum: Thrust;
}

export interface LandingLegs {
  material: string;
  number: number;
}

export interface Mass {
  kg: number;
  lb: number;
}

export interface PayloadWeight {
  id: string;
  kg: number;
  lb: number;
  name: string;
}

export interface SecondStage {
  burn_time_sec: number;
  engines: number;
  fuel_amount_tons: number;
  payloads: Payloads;
  reusable: boolean;
  thrust: Thrust;
}

export interface Payloads {
  composite_fairing: CompositeFairing;
  option_1: string;
}

export interface CompositeFairing {
  diameter: Diameter;
  height: Diameter;
}

export interface Launchpad {
  full_name: string;
  id: string;
  latitude: number;
  launch_attempts: number;
  launch_successes: number;
  launches: string[];
  locality: string;
  longitude: number;
  name: string;
  region: string;
  rockets: string[];
  status: string;
  timezone: string;
}
