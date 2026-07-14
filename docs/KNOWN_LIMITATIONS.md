# Known Limitations

- TASK-008 workout programs, assignments, sessions and progress are not implemented. Existing public Exercises/WorkoutPrograms UI must be audited before reuse.
- AI recommendations, camera, pose estimation, automatic rep counting, medical diagnosis, nutrition, wearables and live coaching are out of scope.
- Product Order bank reconciliation and refunds are manual records; no bank/Stripe API performs settlement.
- Legacy membership payment/configuration is separate from Product Order payment.
- Product image coverage is intentionally limited to verified assets (canonical baseline: 1 ProductImages row).
- Final TASK-007 backend lint passed with 58 pre-existing warnings; frontend production build passed with a non-blocking chunk-size warning.
- Legacy operational modules remain outside TASK-008 refactoring scope and use mixed controller/service patterns.

Real Gmail, Bank/QR, authenticated Customer and Admin browser flows are verified; older contrary limitations are fixed and superseded.
