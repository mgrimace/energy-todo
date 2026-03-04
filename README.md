# Energy Todo

A self-hosted task manager for neurodiverse and neurospicy brains.  Most to-do lists are built around deadlines and priority, but for some folks it’s not about time, it’s about *energy*. Tag tasks by energy cost instead of urgency, then filter your list to match your actual battery: Low battery? Clear a low-energy task for a quick win. Hyperfocused? Settle into a deep work task.

This project was directly inspired by [Executive Function as Code](https://milly.kittycloud.eu/posts/executive-function-as-code-doom-emacs-adhd/) by Milly. 

## Screenshot

| Light mode | Dark mode |
| --- | --- |
| ![Light mode screenshot](./docs/screenshot-light.png) | ![Dark mode screenshot](./docs/screenshot-dark.png) |

*Light and dark mode shown side-by-side.*

## About This Project

I'm Mike, a healthcare provider, researcher, and educator who’s learning to code as a hobby. I built this after struggling to find a minimal, self-hosted task manager that worked with the way my brain organizes energy and attention.

Reading [Executive Function as Code](https://milly.kittycloud.eu/posts/executive-function-as-code-doom-emacs-adhd/) articulated exactly what I felt I had been missing, and [Blake Watson’s article](https://blakewatson.com/journal/i-used-claude-code-and-gsd-to-build-the-accessibility-tool-ive-always-wanted/) inspired me to follow through and actualy build it myself.

I built this alone, in my limited space time. I'm still learning. Pease be patient with any problems and contribute wherever you can. Pull requests to contribute improvements are welcome and encouraged. 

>[!IMPORTANT]: I used AI to help build this project. Without it, this tool wouldn’t exist. I used structured prompts, reviewed the output carefully, and treated the process as a way to learn while building something I genuinely needed.

## Accessibility & Design

Built with accessibility and a neurodiversity-affirming experience in mind. It’s still very much a work in progress.

- Designed with WCAG 2.2 AA in mind
- Uses [Atkinson Hyperlegible](https://brailleinstitute.org/freefont) font for readability
- Keyboard-navigable
- Energy-first (not urgency-first) task categorization to reduce analysis paralysis when everything feels “important”
- Calm, minimal interface to reduce the panic spiral when approaching tasks

## Features

- **Energy-based task categorization** — Assign low, medium, or high energy costs to your tasks
- **Tagging** — Easily create additional tags
- **Filter & search** — Filter by energy and search by words or tags
- **Light & dark themes** — Easy on the eyes
- **Keyboard accessibility** — Navigate and manage tasks without a mouse
- **Minimal** — It's a minimal todo-list, with simple but (I think) clever functionality to reduce cognitive load
- **Self-hosted** — Run it yourself, your data is yours
- **Docker support** — Get it running quickly
- **Progressive Web App** — Install it on your home screen like a native app on any device

## Installation

### Using Docker (Recommended)

**Prerequisites:** Docker and Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/energy-todo.git
   cd energy-todo
   ```

2. (Optional) Set up your environment:
   ```bash
   cp .env.example .env
   ```

3. Start the app:
   ```bash
   docker compose up -d
   ```

4. Open your browser and go to `http://localhost:3000`

Your tasks are saved in the `energy-data/` directory on your machine, so they persist between restarts.

**Install as a PWA:** Once the app is running, look for the install icon in your browser's address bar (or menu) and select "Install app". It will appear on your home screen and work offline.

### Local Development

**Prerequisites:** Node.js, Rust, and Cargo

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
cargo run
```

The frontend dev server runs on `http://localhost:5173` and the backend on `http://localhost:8000`.

## Technology Stack

- **Frontend:** React + Vite
- **Backend:** Rust + Actix Web
- **Database:** JSON file (local storage)
- **Containerization:** Docker & Docker Compose

The project is designed to be straightforward and easy to understand.

## License

This project is licensed under [GNU Affero General Public License v3.0 (AGPL-3.0)](https://www.gnu.org/licenses/agpl-3.0.html).

In plain terms: you can use it, modify it, and share it. If you distribute it or run it as a service for others, you must make your source code available under the same license. This prevents the code from being bundled, sold, or used in closed-source products without sharing the source back.

See the [LICENSE](./LICENSE) file for details.

## Support

If you've found this project helpful and would like to support further development, thank you:

- **PayPal:** https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=R4QX73RWYB3ZA
- **Buy Me a Coffee:** https://www.buymeacoffee.com/cammaratam