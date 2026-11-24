// the settings' ranges and defaults, as the daemon holds them: both read contract/config.schema.json
import schema from '../contract/config.schema.json';

const { properties } = schema;
const engine = schema.$defs.settings.properties;

export const LIMITS = {
  firstAudioMs: properties.firstAudioMs,
  gain: engine.gain,
  meterFlowMs: properties.meterFlowMs,
  meterGlideMs: properties.meterGlideMs,
  speed: engine.speed,
};

// what a number box makes of the text in it: nothing while the text is no number in range yet
export const typed = (text: string, limit: Limit) => {
  const value = Number(text);
  return text.trim() !== '' && value >= limit.minimum && value <= limit.maximum
    ? Math.round(value)
    : undefined;
};

/* Types */
export interface Limit {
  maximum: number;
  minimum: number;
}
