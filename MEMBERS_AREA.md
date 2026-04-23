# Members Area Documentation

## Overview

The members area provides password-protected pages for internal group resources, documents, and announcements. The pages are available in both English and French:

- **English**: https://yoursite.com/members
- **French**: https://yoursite.com/membres

## Current Password

**Default password**: `korolgroup2026`

**IMPORTANT**: You should change this password immediately after setup!

## How to Change the Password

### Step 1: Generate a New Password Hash

1. Go to this online SHA-256 hash generator: https://emn178.github.io/online-tools/sha256.html
2. Enter your desired password
3. Copy the resulting hash (a long string of letters and numbers)

### Step 2: Update Both Pages

Edit both files and replace the `password_hash` value in the front matter:

**File: members.html**
```yaml
---
layout: members
title: "Members Area - Korol Group"
description: "Password-protected area for Korol Group members"
lang: en
password_hash: "YOUR_NEW_HASH_HERE"
---
```

**File: membres.html**
```yaml
---
layout: members
title: "Espace membres - Groupe Korol"
description: "Zone protégée par mot de passe pour les membres du Groupe Korol"
lang: fr
password_hash: "YOUR_NEW_HASH_HERE"
---
```

### Important Notes About Password Security

⚠️ **This is NOT military-grade security!** This password protection:
- ✅ Is good enough for casual access control (lab schedules, internal docs)
- ✅ Prevents search engines from indexing the content (robots noindex)
- ✅ Keeps casual visitors out
- ❌ Can be bypassed by someone with technical skills
- ❌ Should NOT be used for highly sensitive data (unpublished results, grant info, etc.)

For truly sensitive information, use:
- Private GitHub repositories
- University file sharing systems (OneDrive, Google Drive with permissions)
- Secure password managers for shared credentials

## Adding Content to Members Pages

### Option 1: Edit the Data File (Recommended)

Edit `_data/members_content.yml` to add resources, announcements, and links.

**Adding a new announcement:**
```yaml
announcements:
  - date: "2026-04-23"
    en:
      title: "New Lab Equipment"
      content: "We received the new workstation. Training session next week."
    fr:
      title: "Nouvel équipement de laboratoire"
      content: "Nous avons reçu la nouvelle station de travail. Session de formation la semaine prochaine."
```

**Adding a new resource category:**
```yaml
resources:
  en:
    - title: "Training Materials"
      description: "Tutorials and guides for new members"
      items:
        - name: "Getting Started Guide"
          url: "/pdf/getting-started.pdf"
          description: "Introduction to our research group and tools"
```

### Option 2: Directly Edit the HTML Pages

You can also edit [members.html](members.html) and [membres.html](membres.html) directly to add custom content sections.

## File Structure

```
website/
├── _layouts/
│   └── members.html              # Password protection layout template
├── _data/
│   └── members_content.yml       # Members-only content (bilingual)
├── members.html                  # English members page
├── membres.html                  # French members page
└── MEMBERS_AREA.md              # This documentation
```

## How the Password Protection Works

1. **User visits** `/members` or `/membres`
2. **Password prompt** is shown (content is hidden)
3. **User enters password** → JavaScript hashes it using SHA-256
4. **Hash is compared** to the stored hash in the page's front matter
5. **If match**: Content is revealed and session is saved
6. **Session storage** keeps user authenticated until browser tab closes

## Customizing the Members Pages

### Change the Layout/Styling

Edit [_layouts/members.html](_layouts/members.html) to modify:
- Password form design
- Colors and styling
- Page structure

### Add New Sections

Add new sections directly in [members.html](members.html) or [membres.html](membres.html):

```html
<section id="my-new-section">
	<div class="container">
		<header>
			<h3>My New Section</h3>
		</header>
		<p>Content goes here...</p>
	</div>
</section>
```

### Link External Resources

Update the "Quick Links" section or add links to:
- Google Drive folders (with restricted access)
- Shared calendars
- Slack/Discord channels
- GitHub private repositories

## Troubleshooting

### "I forgot the password"

1. Look at the `password_hash` value in `members.html` or `membres.html`
2. Compare it to known hashes (you can hash common passwords and compare)
3. Or simply generate a new password and update the hash

### Password protection not working

1. Clear your browser cache
2. Make sure both pages have the same `password_hash` value
3. Check browser console for JavaScript errors

### Content not showing after entering password

1. Check that content is between `{{ content }}` tags in layout
2. Verify the `_data/members_content.yml` file is valid YAML
3. Rebuild the site: `bundle exec jekyll build`

## Best Practices

1. **Change the default password** immediately
2. **Share password securely** (encrypted email, in-person, password manager)
3. **Update password periodically** (every semester, when members leave)
4. **Don't commit passwords** to git (only commit hashes)
5. **Use different passwords** for different access levels if needed
6. **Document resources** clearly so members can find what they need

## Future Enhancements

Possible improvements:
- Multiple password levels (PI, students, collaborators)
- Password expiration reminders
- File upload area for shared documents
- Calendar integration for group meetings
- Integration with university SSO (Single Sign-On)
