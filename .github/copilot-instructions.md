# KN-Store Frontend Creative Direction

Use this guidance when building frontend views in this repository.

## Creative Goal
- Build expressive, dynamic pages that avoid generic ecommerce templates.
- Prioritize visual rhythm, motion hierarchy, and clear role-aware UX.

## Design Source
- Use patterns inspired by ReactBits for motion and component behavior.
- Keep implementation maintainable and modular.

## Brand Palette
- #034159
- #025951
- #02735E
- #038C3E
- #0CF25D

## Motion Rules
- Use framer-motion for component and page transitions.
- Use gsap only when timeline choreography is needed.
- Use lenis for smooth scrolling in long storytelling pages.
- Always provide reduced-motion fallbacks.

## Frontend Architecture Rules
- Keep global styling centralized in `frontend/src/styles/index.css` and layered files (`tokens.css`, `base.css`, `layout.css`, `components.css`, `responsive.css`).
- Avoid adding new design-only inline styles in React components.
- Keep JSX focused on logic/state/render.
- Allow inline style only for dynamic runtime motion coordinates that cannot be represented by static CSS (for example framer-motion `x/y` spring bindings).
- Prefer semantic class names over ad-hoc style attributes.

## UX Rules
- Public store pages must work without login.
- Client users must never see admin-only controls.
- Manager and Admin can create/update catalog resources.
- Admin-only destructive actions stay hidden for non-admin roles.

## Performance Guardrails
- Animate transform and opacity first.
- Lazy-load heavy interactive sections.
- Keep first interaction fast and avoid blocking scripts.
