import { ok, route } from '@/lib/http.js';
import { PICKUP_LOCATIONS } from '@/lib/constants.js';

// GET /pickup-locations — รายการจุดนัดรับคงที่ในจุฬาฯ (ให้ FE ทำ dropdown)

export const GET = route(async () => ok({ data: PICKUP_LOCATIONS }));