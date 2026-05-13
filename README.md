# Poultry-Aqua-Farming
# FarmFlow

A farm management system for tracking poultry, turkey, and fish farming operations — built to handle real P&L, batch lifecycles, inventory, and housing across multiple farm types.

> Phase 1 covers chickens. Turkey, fish/aquaculture, and an AI advisor layer are planned for future phases.

---

## What it does

- **Batch tracking** — follow a flock from day-1 chicks through to harvest and final sale
- **P&L engine** — real profit/loss per batch and per period, updated as you log
- **Inventory management** — feed stock, medications, supplies, with low-stock alerts
- **Housing management** — pens and coops with capacity tracking and batch assignments
- **Evidence exports** — PDF reports, CSV exports, and an audit trail for investors or grant applications

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Django 4.x + Django REST Framework |
| Database | SQLite (dev) → PostgreSQL (production) |
| Auth | JWT (planned) |
| Frontend | React (planned) |
| Hosting | Render (backend) + Vercel (frontend) |

---

## Project structure

```
farmflow/
├── core/               # Django project settings and root URLs
├── chickens/           # Flock management, batches, daily logs, mortality
├── inventory/          # Feed stock, medications, supplies, alerts
├── financials/         # Costs, sales, P&L engine
├── housing/            # Pens, coops, capacity, batch assignments
├── manage.py
├── venv/
└── .env                # Secret keys — never commit this
```

---

## Getting started

### Prerequisites

- Python 3.10+
- pip
- Ubuntu / Linux (developed on Ubuntu)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/farmflow.git
cd farmflow

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install django djangorestframework django-cors-headers python-dotenv pillow

# Set up environment variables
cp .env.example .env
# Edit .env and add your SECRET_KEY and set DEBUG=True
```

### Environment variables

Create a `.env` file in the project root:

```
SECRET_KEY=your-generated-secret-key
DEBUG=True
```

To generate a secret key:

```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Run the server

```bash
python manage.py migrate
python manage.py runserver
```

Server runs at `http://127.0.0.1:8000/`

---

## Roadmap

### Phase 1 — Chickens (current)
- [x] Project setup and app architecture
- [ ] Django models — Batch, DailyLog, Cost, Sale, Housing
- [ ] REST API endpoints
- [ ] P&L calculation logic
- [ ] Inventory stock and alert system
- [ ] Admin panel configuration
- [ ] React dashboard UI

### Phase 2 — Poultry + Turkey
- [ ] Turkey module using shared batch engine
- [ ] Species-specific parameters (growth rate, FCR targets)
- [ ] Multi-species dashboard view

### Phase 3 — Fish / Aquaculture
- [ ] Fish/tilapia module
- [ ] Tank management and water quality tracking
- [ ] Aqua-specific cost and harvest flows

### Phase 4 — AI layer
- [ ] Yield forecasting based on historical batch data
- [ ] Anomaly detection (unusual mortality, cost spikes)
- [ ] AI advisor for optimising feed and harvest timing
- [ ] Investor and grant evidence dashboard

---

## Apps overview

### `chickens`
Handles everything related to a flock — creating batches, logging daily feed and mortality, recording weight checks, and closing a batch at harvest.

### `inventory`
Tracks stock levels for feed, medications, and farm supplies. Compares current stock against user-defined reorder thresholds and surfaces low-stock warnings.

### `financials`
Records all costs (feed, labour, meds, equipment) and all revenue (bird sales, egg sales, offtake contracts). Calculates P&L per batch, per period, and running totals.

### `housing`
Manages physical farm structures — houses, pens, coops. Tracks capacity, current occupancy, and links each active batch to a location.

---

## Contributing

This is a private project for now. Contribution guidelines will be added when the project opens up.

---

## License

Private — all rights reserved.

---

*Built in Nairobi, Kenya.*
