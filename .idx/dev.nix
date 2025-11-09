{ pkgs, ... }: {
  # --- Base Configuration ---
  # Use the stable Nix channel for predictable package versions
  channel = "stable-24.05";

  # --- Packages ---
  # Core tools available in your development environment
  packages = [
    pkgs.nodejs_20
  ];

  # --- Environment Variables ---
  # Defines all keys needed by the app
  env = {
    # 1. For Genkit AI (Server-side)
    #    (This was already in your v2 nix file)
    GOOGLE_GENAI_API_KEY = "AIzaSyDN1AXPjWaBVVHPSv0ZpujSGHrQ_1DJ6-U";

    # 2. For Firebase Client SDK (Client-side)
    #    (These are the keys you just provided)
    NEXT_PUBLIC_FIREBASE_API_KEY = "AIzaSyDQjJCUM9zsXHLyPBfB6_UFk3SsIBdqYdc";
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "gen-lang-client-0545699517.firebaseapp.com";
    NEXT_PUBLIC_FIREBASE_PROJECT_ID = "gen-lang-client-0545699517";
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "gen-lang-client-0545699517.firebasestorage.app";
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "253278659379";
    NEXT_PUBLIC_FIREBASE_APP_ID = "1:253278659379:web:ab51004201ffa98fb5d446";
  };

  # --- IDX Workspace Configuration ---
  idx = {
    # --- VS Code Extensions ---
    # Installed automatically to enhance your DX
    extensions = [
      "dbaeumer.vscode-eslint"
      "bradlc.vscode-tailwindcss"
      "esbenp.prettier-vscode"
    ];

    # --- Workspace Lifecycle Hooks ---
    # Defines what happens when the environment is created or started
    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
      onStart = {
        dev-server = "npm run dev";
      };
    };

    # --- Previews ---
    # Configure Firebase Studio’s web preview for your app
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
  };
}