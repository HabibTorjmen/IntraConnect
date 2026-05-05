// charge.docx §4.12 — state machine
export type AttendanceState = 'idle' | 'working' | 'on_break' | 'ended';
export type AttendanceAction = 'clock_in' | 'break_start' | 'break_end' | 'clock_out';

const TRANSITIONS: Record<AttendanceState, Partial<Record<AttendanceAction, AttendanceState>>> = {
  idle:     { clock_in:    'working' },
  working:  { break_start: 'on_break', clock_out: 'ended' },
  on_break: { break_end:   'working' },
  ended:    {},
};

export function nextState(state: AttendanceState, action: AttendanceAction): AttendanceState {
  const next = TRANSITIONS[state]?.[action];
  if (!next) {
    throw new Error(`Invalid transition: ${action} from ${state}`);
  }
  return next;
}

export function deriveState(events: Array<{ type: string }>): AttendanceState {
  let s: AttendanceState = 'idle';
  for (const e of events) {
    s = nextState(s, e.type as AttendanceAction);
  }
  return s;
}

export function eventToAction(t: string): AttendanceAction {
  if (t === 'clock_in' || t === 'break_start' || t === 'break_end' || t === 'clock_out') {
    return t;
  }
  throw new Error(`Unknown event type: ${t}`);
}
