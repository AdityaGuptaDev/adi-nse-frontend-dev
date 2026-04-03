# GitHub Actions Deployment Setup

This document explains how to set up the GitHub Actions workflow for deploying your Next.js application to your server.

## Required GitHub Secrets

You need to set up the following secrets in your GitHub repository:

### How to Add Secrets:
1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Required Secrets:

#### `SSH_PRIVATE_KEY`
- **Description**: Your SSH private key for server access
- **Value**: The content of your private SSH key (usually from `~/.ssh/id_rsa` or similar)
- **Format**: 
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  [your private key content]
  -----END OPENSSH PRIVATE KEY-----
  ```

#### `SSH_URL`
- **Description**: SSH connection string to your server
- **Value**: `username@server-ip` or `username@domain.com`
- **Example**: `root@your-server.com` or `deploy@192.168.1.100`

#### `SERVER_HOST`
- **Description**: Server hostname or IP address (for known_hosts)
- **Value**: Just the server IP or domain (without username)
- **Example**: `your-server.com` or `192.168.1.100`

#### `GIT_URL`
- **Description**: SSH Git repository URL
- **Value**: SSH clone URL of your repository
- **Example**: `git@github.com:yourusername/vedant_frontend.git`

## Environment Variables

The following environment variables are configured in the workflow file and can be modified if needed:

- `SERVER_PATH`: Path to your application on the server (`www/gamedoora.prosesenv.com/gamedora-next`)
- `PM2_APP_NAME`: Name of your PM2 application (`gamedoora-4021`)

## Workflow Triggers

The workflow is currently configured to run:
- **Automatically**: When code is pushed to the `development` branch
- **Manually**: Uncomment the `workflow_dispatch` trigger in the workflow file to enable manual runs

## Server Requirements

Your server must have the following installed:
- **Node.js** (version compatible with your Next.js app)
- **npm** (Node Package Manager)
- **PM2** (Process Manager for Node.js applications)
- **Git** (for pulling latest changes)
- **SSH access** configured with your public key

## Workflow Steps

1. **Setup SSH**: Configures SSH client and adds your private key
2. **Deploy to Server**: 
   - Connects to your server via SSH
   - Navigates to the project directory
   - Pulls latest changes from the development branch
   - Installs dependencies with `npm i --force`
   - Builds the application with `npm run build`
   - Restarts the PM2 application

## Optional Features

### File Change Detection
Uncomment the `if` condition in the workflow to only deploy when specific files are changed:
- `src/` directory
- `public/` directory
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `tailwind.config.ts`
- `environment.ts`

### Deployment Status Check
Uncomment the `check_deployment` job to add a post-deployment status check that shows PM2 status and recent logs.

### Manual Deployment
Uncomment the `workflow_dispatch` trigger to enable manual deployment runs from the GitHub Actions tab.

## Troubleshooting

### Common Issues:

1. **SSH Connection Failed (Permission denied)**
   - **Check SSH Private Key Format**: Ensure your private key includes the header and footer:
     ```
     -----BEGIN OPENSSH PRIVATE KEY-----
     [key content]
     -----END OPENSSH PRIVATE KEY-----
     ```
   - **Verify Public Key on Server**: Your public key must be in `~/.ssh/authorized_keys` on the server
   - **Check SSH Key Permissions**: On the server, ensure:
     - `~/.ssh/` directory has permissions `700`
     - `~/.ssh/authorized_keys` file has permissions `600`
   - **Test SSH Connection Locally**: Try connecting from your local machine first:
     ```bash
     ssh -i /path/to/private/key username@server-ip
     ```
   - **Check Server SSH Configuration**: Ensure SSH server allows key-based authentication:
     ```bash
     # On server, check /etc/ssh/sshd_config
     PubkeyAuthentication yes
     AuthorizedKeysFile .ssh/authorized_keys
     ```

2. **Git Pull Failed**
   - Check if `GIT_URL` secret is correct
   - Verify the server has access to your GitHub repository
   - Ensure the deploy key or SSH key has repository access

3. **Build Failed**
   - Check if all dependencies are properly installed
   - Verify Node.js version compatibility
   - Check for sufficient disk space on server

4. **PM2 Restart Failed**
   - Ensure PM2 is installed on the server: `npm install -g pm2`
   - Check if the PM2 application name is correct
   - Verify PM2 process exists: `pm2 list`

### Viewing Logs:
- Go to your repository → **Actions** tab
- Click on the workflow run to see detailed logs
- Each step shows its output for debugging

## Security Notes

- Never commit SSH private keys to your repository
- Use GitHub Secrets for all sensitive information
- Consider using SSH key pairs specifically for deployment
- Regularly rotate your SSH keys for security
