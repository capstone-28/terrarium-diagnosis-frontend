# API 명세서

## 기본 규칙
- 형식: JSON
- 필드명: snake_case
- 시간: ISO 8601
- 결측값: null
- state: `normal | warning | critical | device_fault`

## 공통 응답

### 성공
```json
{
  "ok": true,
  "data": { "...": "..." }
}
```

### 실패
```json
{
  "ok": false,
  "error": {
    "code": "NODE_NOT_FOUND",
    "message": "node_id 'node-01'을 찾을 수 없음"
  }
}
```

## HTTP 상태 코드
- 200: 조회/수정 성공
- 201: 생성 성공
- 204: 삭제 성공
- 400: 입력값 오류
- 404: 리소스 없음
- 409: 중복
- 500: 서버 오류

---

## 1. Node

### `GET /api/nodes`
모든 노드 조회.

**Response 200**
```json
{
  "ok": true,
  "data": [
    {
      "node_id": "node-01",
      "name": "메인 사육장",
      "location": "1번 사육장",
      "created_at": "2026-04-12T20:00:00+09:00",
      "updated_at": "2026-04-12T20:00:00+09:00",
      "last_seen_at": "2026-04-12T20:30:00+09:00"
    }
  ]
}
```

### `POST /api/nodes`
신규 노드 등록.

**Request**
```json
{
  "node_id": "node-01",
  "name": "메인 사육장",
  "location": "1번 사육장"
}
```

### `GET /api/nodes/:node_id`
특정 노드 조회.

### `PATCH /api/nodes/:node_id`
노드 정보 수정.

**Request**
```json
{
  "name": "변경된 이름",
  "location": "새 위치"
}
```

### `DELETE /api/nodes/:node_id`
노드 삭제. 연결된 모든 메시지/이력 cascade 삭제.

---

## 2. Heartbeat

### `POST /api/heartbeat`
heartbeat 수신.

**Request**
```json
{
  "timestamp": "2026-04-12T20:00:00+09:00",
  "node_id": "node-01",
  "message_type": "heartbeat"
}
```

처리:
1. `heartbeats` 테이블에 record 추가
2. `nodes.last_seen_at`을 timestamp로 갱신
3. 직전 상태가 device_fault였으면 `mode_transitions`에 기록

**Response 200**
```json
{
  "ok": true,
  "data": {
    "node_id": "node-01",
    "received_at": "2026-04-12T20:00:00+09:00"
  }
}
```

### `GET /api/nodes/:node_id/heartbeat/latest`
가장 최근 heartbeat 1건.

### `GET /api/nodes/:node_id/heartbeat/history`
heartbeat 이력.

**Query**: `from`, `to`, `limit`

---

## 3. Summary

### `POST /api/summary`
Normal 상태의 평시 요약 메시지 저장.

**Request**
```json
{
  "schema": "terrarium-diagnosis.v1",
  "node_id": "node-01",
  "timestamp_ms": 1775991600000,
  "message_type": "summary",
  "state": "normal",
  "state_changed": false,
  "qos": 0,
  "retain": false,
  "message_expiry_ms": 30000,
  "summary": {
    "ready": true,
    "window_sample_count": 10,
    "window_capacity": 10,
    "hot_surface_temp_c": {
      "ok": true,
      "sample_count": 10,
      "average": 39.2,
      "min": 38.8,
      "max": 39.7
    },
    "hot_air_temp_c": {
      "ok": true,
      "sample_count": 10,
      "average": 34.8,
      "min": 34.2,
      "max": 35.3
    },
    "cool_air_temp_c": {
      "ok": true,
      "sample_count": 10,
      "average": 27.1,
      "min": 26.8,
      "max": 27.4
    },
    "light_level": {
      "ok": true,
      "sample_count": 10,
      "average": 812,
      "min": 805,
      "max": 820
    },
    "temp_gradient_c": {
      "ok": true,
      "sample_count": 10,
      "average": 7.7,
      "min": 7.2,
      "max": 8.1
    }
  },
  "heat_source": {
    "state_ok": true,
    "on": true,
    "on_duration_ms": 420000
  },
  "sensor_status": {
    "usable_for_diagnosis": true,
    "response_failure": false,
    "missing_value": false,
    "out_of_range_value": false,
    "persistent_out_of_range_value": false,
    "repeated_value": false,
    "hot_surface_ok": true,
    "hot_air_ok": true,
    "cool_air_ok": true,
    "light_ok": true
  }
}
```

**Validation**
- `node_id`, `timestamp_ms`, `state`는 필수
- `summary`, `heat_source`, `sensor_status`는 필수
- 노드가 없으면 `nodes`에 upsert하고 `last_seen_at`을 갱신

**Response 201**
```json
{
  "ok": true,
  "data": {
    "id": 1,
    "received_at": "2026-04-12T20:00:00+09:00"
  }
}
```

### `GET /api/summary`
요약 이력 조회.

**Query**: `node_id`, `limit`

### `GET /api/summary/:node_id`
요약 이력.

**Query**: `limit`

---

## 4. Event

### `POST /api/event`
warning 이벤트 저장.

**Request**
```json
{
  "timestamp": "2026-04-12T20:05:00+09:00",
  "node_id": "node-01",
  "message_type": "event",
  "state": "warning",
  "surface_temp_c": 41.5,
  "hot_air_temp_c": 36.0,
  "cool_air_temp_c": 28.0,
  "light_level": 800,
  "heat_source_on": true,
  "l_match": 0,
  "l_grad": 1,
  "l_safety": 0,
  "l_final": 1,
  "fault_reason": null
}
```

### `GET /api/event`
모든 이벤트 조회.

**Query**: `node_id`, `from`, `to`, `limit`

### `GET /api/nodes/:node_id/event`
특정 노드 이벤트 이력.

---

## 5. Alert

### `POST /api/alert`
critical 알림 저장.

**Request**
```json
{
  "timestamp": "2026-04-12T20:10:00+09:00",
  "node_id": "node-01",
  "message_type": "alert",
  "state": "critical",
  "surface_temp_c": 45.2,
  "hot_air_temp_c": 38.0,
  "cool_air_temp_c": 28.5,
  "light_level": 800,
  "heat_source_on": true,
  "l_match": 0,
  "l_grad": 1,
  "l_safety": 2,
  "l_final": 2,
  "fault_reason": null
}
```

### `GET /api/alert`
모든 알림 조회.

### `GET /api/nodes/:node_id/alert`
특정 노드 알림 이력.

---

## 6. Fault

### `POST /api/fault`
장치 이상 보고.

**Request**
```json
{
  "timestamp": "2026-04-12T20:15:00+09:00",
  "node_id": "node-01",
  "message_type": "fault",
  "state": "device_fault",
  "surface_temp_c": null,
  "hot_air_temp_c": 36.0,
  "cool_air_temp_c": 28.0,
  "light_level": 800,
  "heat_source_on": true,
  "l_match": null,
  "l_grad": null,
  "l_safety": null,
  "l_final": null,
  "fault_reason": "surface_temp_c 60초간 갱신 없음"
}
```

### `GET /api/fault`
모든 fault 조회.

### `GET /api/nodes/:node_id/fault`
특정 노드 fault 이력.

---

## 7. Mode Transition

### `GET /api/nodes/:node_id/transitions`
상태 전이 이력 조회.

**Response 200**
```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "node_id": "node-01",
      "timestamp": "2026-04-12T20:05:00+09:00",
      "from_state": "normal",
      "to_state": "warning",
      "reason": "l_grad=1"
    }
  ]
}
```

### `GET /api/nodes/:node_id/transitions/diagnostic-entries`
진단 모드 진입 시점만 필터링.

---

## 8. Dashboard

### `GET /api/dashboard/overview`
전체 시스템 현황.

**Response 200**
```json
{
  "ok": true,
  "data": {
    "total_nodes": 5,
    "online_nodes": 4,
    "offline_nodes": 1,
    "active_warnings": 2,
    "active_criticals": 0,
    "active_faults": 1
  }
}
```

### `GET /api/dashboard/temperature-trend`
온도 추이.

**Query**: `node_id`, `from`, `to`, `interval` (예: `1m` / `5m` / `1h`)

**Response 200**
```json
{
  "ok": true,
  "data": [
    {
      "timestamp": "2026-04-12T20:00:00+09:00",
      "surface_temp_c": 39.2,
      "hot_air_temp_c": 34.8,
      "cool_air_temp_c": 27.1
    }
  ]
}
```

### `GET /api/dashboard/gradient-changes`
온도구배 변화 (G = `hot_air_temp_c - cool_air_temp_c`).

### `GET /api/dashboard/diagnostic-mode-entries`
진단 모드 진입 시점.

### `GET /api/dashboard/node-sensor-status`
노드·센서 상태 기록.

### `GET /api/dashboard/latest`
각 노드의 최신 측정값과 진단 결과.

---

## 9. MQTT 토픽

```text
terrarium/<node_id>/summary
terrarium/<node_id>/event
terrarium/<node_id>/alert
terrarium/<node_id>/fault
terrarium/<node_id>/heartbeat
```

| state | topic | QoS | Expiry |
|-------|-------|-----|--------|
| normal | summary | 0 | 30s |
| warning | event | 1 | 300s |
| critical | alert | 1 | 1800s |
| device_fault | fault | 1 | 600s |

메시지 페이로드는 data-spec.md 규격을 따른다.

### 공통 MQTT DTO

펌웨어 payload는 HTTP 저장 필드와 일부 이름이 다르다. 예를 들어 MQTT sensor value는 `hot_surface_temp_c`를 사용하고, HTTP 저장 API는 `surface_temp_c`를 사용한다.

```ts
export const StateSchema = z.enum(["normal", "warning", "critical", "device_fault"]);

export const SensorValuesSchema = z.object({
  hot_surface_temp_c: z.number().nullable(),
  hot_air_temp_c: z.number().nullable(),
  cool_air_temp_c: z.number().nullable(),
  light_level: z.number().int().nullable(),
});

export const FeaturesSchema = z.object({
  temp_gradient_ok: z.boolean(),
  temp_gradient_c: z.number().nullable(),
  heat_source_state_ok: z.boolean(),
  heat_source_on: z.boolean(),
  heat_source_on_since_ms: z.number().int().nonnegative(),
  heat_source_on_duration_ms: z.number().int().nonnegative(),
  surface_temp_step_delta_ok: z.boolean(),
  surface_temp_step_delta_c: z.number().nullable(),
  surface_temp_rise_since_heat_on_ok: z.boolean(),
  surface_temp_rise_since_heat_on_c: z.number().nullable(),
});

const DiagnosisBaseSchema = z.object({
  status: StateSchema,
  l_match: z.number().int().min(0).max(2),
  l_grad: z.number().int().min(0).max(2),
  l_safety: z.number().int().min(0).max(2),
  l_fault: z.number().int().min(0),
  l_final: z.number().int().min(0).max(2),
  cause_flags: z.string().nullable(),
  fault_reason: z.string().nullable(),
});

export const DiagnosisRequiredSchema = DiagnosisBaseSchema;
export const DiagnosisOptionalSchema = DiagnosisBaseSchema.partial();

export const SensorStatusSchema = z.object({
  usable_for_diagnosis: z.boolean(),
  response_failure: z.boolean(),
  missing_value: z.boolean(),
  out_of_range_value: z.boolean(),
  persistent_out_of_range_value: z.boolean(),
  repeated_value: z.boolean(),
  hot_surface_ok: z.boolean(),
  hot_air_ok: z.boolean(),
  cool_air_ok: z.boolean(),
  light_ok: z.boolean(),
});

export const SummaryValueSchema = z.object({
  ok: z.boolean(),
  sample_count: z.number().int().nonnegative(),
  average: z.number().nullable(),
  min: z.number().nullable(),
  max: z.number().nullable(),
});
```

### Summary DTO

`summary` 메시지는 `comms_build_summary_payload`의 평시 요약 payload다. `heat_source`는 `summary` 객체 내부가 아니라 최상위 필드로만 정의한다.

```ts
export const SummaryDto = z.object({
  schema: z.string().optional(),
  node_id: z.string().min(1),
  timestamp_ms: z.number().int().nonnegative(),
  message_type: z.literal("summary").optional(),
  state: StateSchema,
  state_changed: z.boolean().default(false),
  qos: z.number().int().min(0).max(2).default(0),
  retain: z.boolean().default(false),
  message_expiry_ms: z.number().int().positive().default(30000),

  summary: z.object({
    ready: z.boolean(),
    window_sample_count: z.number().int().nonnegative(),
    window_capacity: z.number().int().positive(),
    hot_surface_temp_c: SummaryValueSchema,
    hot_air_temp_c: SummaryValueSchema,
    cool_air_temp_c: SummaryValueSchema,
    light_level: SummaryValueSchema,
    temp_gradient_c: SummaryValueSchema,
  }),

  heat_source: z.object({
    state_ok: z.boolean(),
    on: z.boolean(),
    on_duration_ms: z.number().int().nonnegative(),
  }),

  sensor_status: SensorStatusSchema,
});
```

### Heartbeat DTO

`heartbeat` 메시지는 노드 생존 여부와 MQTT 연결 상태, 가동 시간을 전달한다.

```ts
export const HeartbeatDto = z.object({
  schema: z.string().optional(),
  node_id: z.string().min(1),
  timestamp_ms: z.number().int().nonnegative(),
  message_type: z.literal("heartbeat").optional(),
  state: StateSchema,
  mqtt_connected: z.boolean().default(true),
  uptime_ms: z.number().int().nonnegative().default(0),
});
```

### Alert DTO

`alert` 메시지는 `comms_build_diagnostic_payload`의 `COMMS_MESSAGE_ALERT` payload이며, critical 상태 전용이므로 `features`와 `diagnosis`를 필수로 가진다. `state_transition` 블록은 포함하지 않고 `state_changed` 플래그만 사용한다.

```ts
export const AlertDto = z.object({
  schema: z.string().optional(),
  node_id: z.string().min(1),
  timestamp_ms: z.number().int().nonnegative(),
  message_type: z.literal("alert").optional(),
  state: StateSchema,
  state_changed: z.boolean().default(false),
  qos: z.number().int().min(0).max(2).default(1),
  retain: z.boolean().default(false),
  message_expiry_ms: z.number().int().positive().default(1800000),

  sensor_values: SensorValuesSchema.optional(),
  features: FeaturesSchema,
  diagnosis: DiagnosisRequiredSchema,
  sensor_status: SensorStatusSchema,
});
```

### Event DTO

`event` 메시지는 `comms_build_diagnostic_payload`의 `COMMS_MESSAGE_EVENT` payload다. `state_transition.state_changed`와 최상위 `state_changed` 중복을 피하기 위해 `state_transition` 블록은 제거하고 최상위 `state_changed`만 사용한다.

```ts
export const EventDto = z.object({
  schema: z.string().optional(),
  node_id: z.string().min(1),
  timestamp_ms: z.number().int().nonnegative(),
  message_type: z.literal("event").optional(),
  state: StateSchema,
  state_changed: z.boolean().default(false),
  qos: z.number().int().min(0).max(2).default(1),
  retain: z.boolean().default(false),
  message_expiry_ms: z.number().int().positive().default(300000),

  sensor_values: SensorValuesSchema.optional(),
  features: FeaturesSchema.optional(),
  diagnosis: DiagnosisRequiredSchema,
  sensor_status: SensorStatusSchema,
});
```

### Fault DTO

`fault` 메시지는 `comms_build_fault_payload`의 장치 이상 payload다. `fault_reason`은 firmware와 DB 정책에 맞춰 nullable이며, 센서 이상으로 진단 자체가 불가능한 경우를 위해 `diagnosis`는 optional이다.

```ts
export const FaultDto = z.object({
  schema: z.string().optional(),
  node_id: z.string().min(1),
  timestamp_ms: z.number().int().nonnegative(),
  message_type: z.literal("fault").optional(),
  state: StateSchema,
  state_changed: z.boolean().default(false),
  qos: z.number().int().min(0).max(2).default(1),
  retain: z.boolean().default(false),
  message_expiry_ms: z.number().int().positive().default(600000),

  fault: z.object({
    sensor_response_failure: z.boolean().default(false),
    missing_value: z.boolean().default(false),
    out_of_range_value: z.boolean().default(false),
    persistent_out_of_range_value: z.boolean().default(false),
    repeated_value: z.boolean().default(false),
    fault_reason: z.string().nullable(),
  }),

  sensor_values: SensorValuesSchema.optional(),
  diagnosis: DiagnosisOptionalSchema.optional(),
  sensor_status: SensorStatusSchema,
});
```

---

## 10. 환경 변수

`backend/.env`

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/railway"
PORT=3000
MQTT_BROKER_URL="mqtts://broker.example.com:8883"
HEARTBEAT_THRESHOLD_OFFLINE_SEC=60
HEARTBEAT_CHECK_INTERVAL_SEC=30
```
