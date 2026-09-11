<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const supabase = useSupabaseClient()

// ── Rich gate data ──────────────────────────────────────────────────────────

const GATES = [
  {
    month: 3,
    title: 'Month 3 Gate',
    description: 'Foundation — build the base before you go up',
    criteria: [
      {
        label: 'AWS SAA-C03 — Score ≥70% on 3 consecutive practice exams',
        icon: 'i-simple-icons-amazonaws',
        color: 'text-orange-400',
        detail: {
          why: 'AWS SAA is your entry ticket to cloud roles. Hiring managers filter CVs by it. At Month 3 you\'re not sitting the exam yet — you\'re proving you\'re on track.',
          milestone: 'Score ≥70% on 3 consecutive TutorialsDojo timed exams (65 questions, 130 min each). Screenshot every result.',
          domains: [
            {
              name: 'Domain 1 — Design Secure Architectures',
              weight: '30%',
              topics: [
                'IAM: users, groups, roles, policies (identity vs resource policies)',
                'STS AssumeRole for cross-account access',
                'S3 bucket policies, ACLs, Block Public Access, pre-signed URLs',
                'VPC: security groups (stateful) vs NACLs (stateless)',
                'KMS: CMKs, envelope encryption, key policies',
                'Secrets Manager vs SSM Parameter Store',
                'CloudTrail, GuardDuty, Security Hub, Macie, Inspector'
              ]
            },
            {
              name: 'Domain 2 — Design Resilient Architectures',
              weight: '26%',
              topics: [
                'Multi-AZ RDS vs Read Replicas (failover vs read scaling)',
                'ALB + Auto Scaling Groups: target tracking vs step scaling',
                'S3: versioning, MFA delete, CRR/SRR replication',
                'Route53: failover, latency, weighted, geolocation routing',
                'SQS: standard vs FIFO, visibility timeout, DLQ',
                'SNS fan-out pattern with SQS',
                'EFS: multi-AZ shared file system (vs EBS single-AZ)'
              ]
            },
            {
              name: 'Domain 3 — Design High-Performing Architectures',
              weight: '24%',
              topics: [
                'EC2: instance families (C = compute, R = memory, I = storage, G = GPU)',
                'EC2 placement groups: cluster vs spread vs partition',
                'ElastiCache: Redis (persistence, pub/sub) vs Memcached (simple cache)',
                'CloudFront: origins, behaviours, OAC for S3, Lambda@Edge',
                'DynamoDB: partition key design, GSI/LSI, DAX, Streams',
                'EBS: gp3 vs io2 vs st1 vs sc1 — use cases and IOPS limits',
                'RDS: Aurora vs standard, Aurora Serverless v2'
              ]
            },
            {
              name: 'Domain 4 — Design Cost-Optimized Architectures',
              weight: '20%',
              topics: [
                'EC2 pricing: On-Demand vs Reserved (1yr/3yr) vs Spot vs Savings Plans',
                'S3 storage classes: Standard → IA → One-Zone-IA → Glacier Instant → Glacier Flexible → Deep Archive',
                'S3 Lifecycle policies — automatic class transitions',
                'Lambda vs EC2 cost model (Lambda = pay per invocation ms)',
                'NAT Gateway vs NAT Instance cost comparison',
                'AWS Cost Explorer, Budgets, Trusted Advisor checks'
              ]
            }
          ],
          tips: [
            'Read the official FAQ for EC2, S3, VPC, RDS, IAM — SAA questions pull directly from FAQs',
            'Answer pattern: "most cost-effective AND highly available" → look for Reserved + Multi-AZ combos',
            'Shared Responsibility Model: AWS secures the cloud; you secure what\'s in the cloud',
            'When in doubt between two answers, pick the managed service (RDS over self-managed MySQL on EC2)',
            'Practice 65-question timed sets from Day 1 — exam stamina is real'
          ],
          resources: [
            { name: 'Stephane Maarek — AWS SAA-C03 (Udemy, ~28h)', url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/' },
            { name: 'TutorialsDojo Practice Exams (primary)', url: 'https://tutorialsdojo.com/courses/aws-certified-solutions-architect-associate-practice-exams/' },
            { name: 'Whizlabs Practice Exams (secondary bank)', url: 'https://www.whizlabs.com/aws-solutions-architect-associate/' },
            { name: 'AWS SAA-C03 Official Exam Guide (PDF)', url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/' },
            { name: 'AWS Well-Architected Framework', url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html' },
            { name: 'AWS FAQ index (EC2, S3, IAM, VPC, RDS)', url: 'https://aws.amazon.com/faqs/' }
          ]
        }
      },
      {
        label: 'Python basics — data types → control flow → functions → file I/O → boto3 intro',
        icon: 'i-simple-icons-python',
        color: 'text-blue-400',
        detail: {
          why: 'Python is the automation language of cloud. Lambda, Boto3, CDK, Ansible — they all speak Python. You need it before Month 4.',
          milestone: 'Build a boto3 script that lists all S3 buckets + their regions and sizes, writes output to a JSON file, and runs clean with no errors.',
          topics: [
            'Core: str, int, float, bool, list, dict, tuple, set — know mutability rules',
            'Control flow: if/elif/else, for loops, while, list/dict comprehensions',
            'Functions: def, *args, **kwargs, return, default args, type hints',
            'Error handling: try/except/else/finally, raise, custom exceptions',
            'File I/O: open() with context managers, pathlib.Path, json.load/dump',
            'Standard library: os, sys, datetime, argparse, subprocess',
            'boto3 basics: session, resource vs client, list_buckets, describe_instances',
            'Code quality: f-strings, PEP8 basics, meaningful names, no magic numbers'
          ],
          resources: [
            { name: 'Automate the Boring Stuff with Python (free online)', url: 'https://automatetheboringstuff.com/' },
            { name: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/' },
            { name: 'boto3 Documentation — Quickstart', url: 'https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html' },
            { name: 'Real Python — Practical Python tutorials', url: 'https://realpython.com/' }
          ]
        }
      },
      {
        label: 'Bash scripting — 3 automation scripts written, tested, and documented',
        icon: 'i-lucide-terminal',
        color: 'text-green-400',
        detail: {
          why: 'Every Linux server you SSH into expects you to know Bash. It\'s the duct tape holding cloud infra together.',
          milestone: 'Three scripts in a GitHub repo with README — each runs without errors on a fresh Ubuntu VM.',
          topics: [
            'Variables, quoting, parameter expansion (${VAR:-default}, ${#VAR}, ${VAR%suffix})',
            'Conditionals: if/elif/else, [[ ]] test expressions, exit codes',
            'Loops: for, while, until — iterate over files, arrays, command output',
            'Functions in bash: local scope, return values via echo',
            'Text processing: grep -E, sed -i, awk for column extraction',
            'find: by name, type, mtime, size — combine with -exec',
            'Cron jobs: crontab -e syntax, logging to file, locking with flock',
            'Error handling: set -e, set -u, set -o pipefail, trap ERR'
          ],
          scripts: [
            'backup.sh — tar + gzip a directory with timestamp, keep last 7, delete older',
            'disk-alert.sh — check df -h, if any mount >80% write warning to syslog + print',
            'log-parser.sh — scan /var/log/syslog for ERROR lines, count per hour, output CSV'
          ],
          resources: [
            { name: 'The Linux Command Line (free PDF)', url: 'https://linuxcommand.org/tlcl.php' },
            { name: 'ShellCheck — lint your bash scripts', url: 'https://www.shellcheck.net/' },
            { name: 'explainshell — explains any shell command', url: 'https://explainshell.com/' },
            { name: 'Bash Guide for Beginners (TLDP)', url: 'https://tldp.org/LDP/Bash-Beginners-Guide/html/' }
          ]
        }
      },
      {
        label: 'First cloud project live — static site with S3 + CloudFront + custom domain',
        icon: 'i-lucide-globe',
        color: 'text-purple-400',
        detail: {
          why: 'Recruiters Google you. A live project on your own domain proves you can ship, not just study.',
          milestone: 'Public URL resolving over HTTPS with your domain. Site loads in <2s. URL in CV and LinkedIn.',
          steps: [
            '1. Create S3 bucket (same name as domain, e.g. cv.yourdomain.com)',
            '2. Enable Static Website Hosting on the bucket',
            '3. Upload your HTML/CSS — or build a simple Vue/React site',
            '4. Create CloudFront distribution → S3 as origin, use OAC (not OAI)',
            '5. Request ACM certificate in us-east-1 (required for CloudFront)',
            '6. Attach certificate to CloudFront distribution',
            '7. Add CNAME or Alias record in Route53 pointing to CloudFront domain',
            '8. Test HTTPS: curl -I https://yourdomain.com → 200 OK'
          ],
          alternatives: [
            'Cloud Resume Challenge path (cloudresumechallenge.dev) — adds Lambda + DynamoDB visitor counter, highly recommended',
            'Vercel deploy + Cloudflare DNS (faster, free, still counts for portfolio)'
          ],
          resources: [
            { name: 'Cloud Resume Challenge', url: 'https://cloudresumechallenge.dev/' },
            { name: 'AWS — Host a Static Website (docs)', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html' },
            { name: 'AWS CloudFront + S3 OAC guide', url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html' }
          ]
        }
      },
      {
        label: 'Daily log maintained — ≥25 entries in Month 3 (≥80% of 31 days)',
        icon: 'i-lucide-notebook-pen',
        color: 'text-yellow-400',
        detail: {
          why: 'Consistency is the only variable that separates people who make career transitions from people who talk about making them.',
          milestone: '25+ log entries in the Daily Log page by end of Month 3. Even a 3-line log counts.',
          tracking: [
            'Log before 10pm daily — set a phone alarm at 9pm',
            'Minimum viable log: 1 output + energy level. Takes 2 minutes.',
            'Weekly review (Sunday): look at the week\'s logs, spot the days you skipped — why?',
            'If energy was 1-2 for 3+ days in a row: something is wrong. Adjust, don\'t push.'
          ]
        }
      }
    ]
  },
  {
    month: 6,
    title: 'Month 6 Gate',
    description: 'Foundation Certified — are you cloud-ready?',
    criteria: [
      {
        label: 'AWS SAA-C03 exam passed (score ≥720/1000)',
        icon: 'i-simple-icons-amazonaws',
        color: 'text-orange-400',
        detail: {
          why: 'AWS SAA is the most recognised entry-level cloud credential. Hiring managers use it as a filter — CVs without it are frequently screened before human review.',
          milestone: 'Score ≥720/1000 on SAA-C03 via Pearson VUE online proctored (USD 150). Credly badge received and posted to LinkedIn.',
          topics: [
            'IAM: users, groups, roles, policies, MFA, identity federation, SCPs',
            'EC2: instance families, pricing (On-Demand/Reserved/Spot), ASG, Launch Templates, placement groups',
            'VPC: public/private subnets, route tables, IGW, NAT Gateway, security groups vs NACLs, peering, Transit Gateway',
            'S3: storage classes (Standard → IA → Glacier), lifecycle policies, versioning, CRR, pre-signed URLs, OAC',
            'RDS: Multi-AZ vs Read Replicas, Aurora Serverless, automated backups, KMS encryption',
            'Lambda: event triggers (S3/API GW/SQS/EventBridge), concurrency, Layers, cold starts',
            'CloudFront: distributions, origins, cache behaviours, OAC, Lambda@Edge',
            'Route 53: Simple/Weighted/Latency/Failover/Geolocation/Geoproximity routing, health checks, alias records',
            'ELB: ALB (Layer 7) vs NLB (Layer 4), target groups, listener rules, sticky sessions',
            'SQS/SNS: Standard vs FIFO, DLQ, visibility timeout, fan-out pattern',
            'CloudWatch: metrics, alarms, composite alarms, Log Insights, EventBridge rules',
            'KMS: CMKs, envelope encryption, key rotation, key policies',
            'Well-Architected Framework: 6 pillars (Operational Excellence, Security, Reliability, Performance, Cost, Sustainability)',
            'Shared Responsibility Model: AWS secures the cloud; you secure what\'s in it — memorise the boundary per service type'
          ],
          tips: [
            'Complete ≥400 practice questions — TutorialsDojo timed mode replicates exam pressure better than AWS\'s own samples',
            'Exam is scenario-based: eliminate wrong answers first, then pick "most cost-effective" OR "most resilient" — not both simultaneously',
            'Build a VPC from scratch in the console (not just reading about it) — architecture questions become concrete once you\'ve done it',
            'After passing, post the Credly badge to LinkedIn immediately and add the cert with expiry date — badges without dates look suspicious',
            'AWS provides a free practice exam voucher after your first real certification — use it for the next cert'
          ],
          resources: [
            { name: 'AWS SAA-C03 Official Cert Page', url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/' },
            { name: 'Stephane Maarek — AWS SAA-C03 (Udemy)', url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/' },
            { name: 'TutorialsDojo SAA Practice Exams', url: 'https://portal.tutorialsdojo.com/courses/aws-certified-solutions-architect-associate-practice-exams/' },
            { name: 'Adrian Cantrill SAA-C03 (deepest dives)', url: 'https://learn.cantrill.io/p/aws-certified-solutions-architect-associate' },
            { name: 'AWS Skill Builder — Free Official Practice', url: 'https://skillbuilder.aws/' },
            { name: 'TutorialsDojo AWS Cheat Sheets', url: 'https://tutorialsdojo.com/aws-cheat-sheets/' }
          ]
        }
      },
      {
        label: 'Terraform basics: IaC for VPC, EC2, S3 — public GitHub repo with 3 configs',
        icon: 'i-simple-icons-terraform',
        color: 'text-violet-400',
        detail: {
          why: 'IaC is now a core expectation in cloud engineering job descriptions. Terraform is provider-agnostic and dominates outside pure-AWS shops. Hands-on Terraform alongside SAA proves you provision infrastructure repeatably, not just via console clicks.',
          milestone: 'Public GitHub repo: 3 Terraform configs (VPC, EC2, S3), each with passing `terraform validate`, a working `terraform plan` output committed as text, and a documented README.',
          topics: [
            'HCL syntax: terraform{}, provider{}, resource{}, data{}, variable{}, output{}, locals{}',
            'Provider config: required_providers with source + version constraints (~> 5.0), never hardcode access keys — use env vars or IAM roles',
            'Resource references: aws_vpc.main.id, depends_on, lifecycle (create_before_destroy, prevent_destroy, ignore_changes)',
            'Variables: type constraints (string, number, bool, list, map, object), default, sensitive',
            'Functions: lookup(), merge(), length(), toset(), join(), cidrsubnet(), file(), templatefile()',
            'Iteration: for_each = toset([...]) and count with count.index',
            'State management: terraform.tfstate maps config to real infra IDs; local vs remote backend',
            'Remote backend: S3 bucket + DynamoDB table for state locking (bucket, key, region, dynamodb_table, encrypt = true)',
            'Core commands: init → validate → fmt → plan → apply → destroy; terraform state list/show/mv/rm/import',
            'Modules: source (local ./modules/vpc, registry terraform-aws-modules/vpc/aws, GitHub), inputs/outputs, no provider block inside a module',
            'File layout: main.tf, variables.tf, outputs.tf, terraform.tfvars, versions.tf, .gitignore (.terraform/, *.tfstate, *.tfvars)',
            'Environments pattern: environments/dev/terraform.tfvars, environments/prod/terraform.tfvars sharing a modules/ directory'
          ],
          tips: [
            'Always read the full `terraform plan` diff before apply — that\'s the entire point of IaC over console clicking',
            'Run `terraform fmt` and `terraform validate` before every commit; add as a pre-commit Git hook',
            'Never store secrets in committed .tfvars files — use SSM Parameter Store and reference via data.aws_ssm_parameter',
            'Start with local state, then migrate to S3 + DynamoDB remote backend before sharing config with anyone else',
            'Comment your Terraform with the why, not the what — the HCL already shows what; the comment should explain the architectural reason'
          ],
          resources: [
            { name: 'HashiCorp Terraform Documentation', url: 'https://developer.hashicorp.com/terraform/docs' },
            { name: 'HashiCorp Terraform Tutorials (free, hands-on)', url: 'https://developer.hashicorp.com/terraform/tutorials' },
            { name: 'Zeal Vora — Terraform Beginner to Advanced (Udemy)', url: 'https://www.udemy.com/course/terraform-beginner-to-advanced/' },
            { name: 'Terraform AWS Modules — Official Registry', url: 'https://registry.terraform.io/namespaces/terraform-aws-modules' },
            { name: 'Spacelift — Terraform Best Practices', url: 'https://spacelift.io/blog/terraform-best-practices' }
          ]
        }
      },
      {
        label: 'Python project: CLI tool or automation script deployed to AWS',
        icon: 'i-simple-icons-python',
        color: 'text-blue-400',
        detail: {
          why: 'Cloud engineers automate everything. A shipped Python project proves you can write code — not just click in the console — and separates you from candidates who have only consumed tutorials.',
          milestone: 'Python CLI tool committed to a public GitHub repo, deployed to AWS (Lambda, EC2, or scheduled ECS task), with a README explaining the problem it solves, local install instructions, and example terminal output.',
          topics: [
            'boto3: pip install boto3; configure via ~/.aws/credentials or IAM instance role (always prefer IAM role in production)',
            'boto3 resource API (OO) vs client API (1:1 with AWS API): s3.Bucket().upload_file() vs s3_client.put_object()',
            'Pagination: paginator = client.get_paginator(\'describe_instances\'); for page in paginator.paginate(): ...',
            'Error handling: botocore.exceptions.ClientError — check e.response[\'Error\'][\'Code\'] for specific error types',
            'Click library: @click.command(), @click.option(), @click.argument() decorators for professional CLIs',
            'Configuration: python-dotenv for local .env, os.environ.get(\'VAR\', \'default\') at runtime',
            'Logging: logging.basicConfig(level=logging.INFO) — captured by CloudWatch Logs when deployed',
            'Lambda handler: def handler(event, context): — event is trigger payload dict, context has function_name, aws_request_id',
            'Lambda packaging: zip -r function.zip . for pure Python; Lambda Layers for shared libraries',
            'Project ideas: EC2 start/stop scheduler by tag, S3 stale-file cleaner, IAM access key age reporter, CloudWatch cost anomaly emailer via SES',
            'Testing: pytest + moto to mock AWS calls — even basic coverage demonstrates engineering maturity',
            'Packaging: pyproject.toml (modern), requirements.txt, python -m venv .venv'
          ],
          resources: [
            { name: 'boto3 Official Documentation', url: 'https://boto3.amazonaws.com/v1/documentation/api/latest/index.html' },
            { name: 'Click — Python CLI Framework', url: 'https://click.palletsprojects.com/' },
            { name: 'Real Python — Python, Boto3, and AWS S3', url: 'https://realpython.com/python-boto3-aws-s3/' },
            { name: 'AWS Lambda Developer Guide — Python', url: 'https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html' },
            { name: 'moto — Mock AWS Services for Testing', url: 'https://docs.getmoto.org/en/latest/' }
          ]
        }
      },
      {
        label: 'Portfolio site live with 2 projects documented (problem → architecture → outcome)',
        icon: 'i-lucide-globe',
        color: 'text-purple-400',
        detail: {
          why: 'A portfolio site converts CV claims into evidence. Cloud engineers are expected to have public GitHub profiles — a dedicated site that narrates thinking shifts your positioning from "job seeker" to "practitioner".',
          milestone: 'Live, publicly accessible site with 2 project pages each containing: problem statement, architecture diagram, tech choices with rationale, GitHub repo link, and a quantified outcome.',
          steps: [
            '1. Deploy site: GitHub Pages (free), Netlify (free, automatic SSL), or S3+CloudFront (portfolio project itself)',
            '2. Homepage: headshot, 2-sentence bio with location (Nairobi, Kenya), cert status, what you\'re seeking',
            '3. Per project: Problem → Architecture → Decisions → Implementation → Outcome → What I\'d Change',
            '4. Architecture diagrams: diagrams.net (free, has official AWS icons stencils)',
            '5. Custom domain: Namecheap (international) or KenyaDomains.co.ke for .co.ke',
            '6. Month 6 project candidates: Terraform-provisioned VPC (documented), Python boto3 CLI tool (with terminal demo)',
            '7. README standard per GitHub repo: badge, 1-paragraph description, Quick Start, screenshot/diagram, tech stack list'
          ],
          resources: [
            { name: 'GitHub Pages — Getting Started', url: 'https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages' },
            { name: 'Netlify — Deploy a Site', url: 'https://docs.netlify.com/site-deploys/overview/' },
            { name: 'diagrams.net — Free Architecture Diagrams', url: 'https://www.diagrams.net/' },
            { name: 'AWS Architecture Icons (Official)', url: 'https://aws.amazon.com/architecture/icons/' }
          ]
        }
      },
      {
        label: 'First job applications sent (≥10) — tracked in spreadsheet',
        icon: 'i-lucide-briefcase',
        color: 'text-emerald-400',
        detail: {
          why: 'Starting applications at Month 6 — while still mid-transition — provides market feedback early enough to adjust your approach before Month 10. Every rejected application is data.',
          milestone: 'Spreadsheet with ≥10 applications: Company, Role Title, Date Applied, Source, Status, Recruiter/Contact, Next Action.',
          topics: [
            'Target roles at Month 6: Cloud Engineer (Junior), DevOps Engineer (Junior), Infrastructure Engineer (AWS), Cloud Support Engineer',
            'Adjacent on-ramp roles: Systems Administrator with cloud exposure, IT Infrastructure Engineer (transitioning), Cloud Support at AWS/Google',
            'Kenya job boards: BrighterMonday (brightermonday.co.ke — IT/Telecoms filter), MyJobMag Kenya, LinkedIn Jobs (Kenya)',
            'Remote boards: We Work Remotely (DevOps/Sysadmin category), Remote OK, LinkedIn (Remote + Cloud/DevOps filter)',
            'Kenyan companies worth targeting: Safaricom, Equity Bank Tech, Andela (Kenya office), NGO tech hubs (World Bank IFC, UN agencies)',
            'ATS keyword mirroring: copy exact phrases from JD — "infrastructure as code" vs "IaC" both matter',
            'Referral outreach: search LinkedIn for Kenyan cloud engineers at target company before applying cold',
            'Community: iHub Kenya events, AWS User Group Kenya (quarterly meetups), Nairobi Tech Week'
          ],
          resources: [
            { name: 'BrighterMonday Kenya — IT Jobs', url: 'https://www.brightermonday.co.ke/jobs/it-telecoms' },
            { name: 'MyJobMag Kenya — Tech Jobs', url: 'https://www.myjobmag.co.ke/jobs-in-kenya/information-technology' },
            { name: 'LinkedIn Jobs — Cloud Engineer Kenya', url: 'https://www.linkedin.com/jobs/search/?keywords=cloud+engineer&location=Kenya' },
            { name: 'We Work Remotely — DevOps & Sysadmin', url: 'https://weworkremotely.com/categories/remote-devops-sysadmin-jobs' },
            { name: 'AWS User Group Kenya', url: 'https://www.linkedin.com/groups/12469963/' }
          ]
        }
      }
    ]
  },
  {
    month: 9,
    title: 'Month 9 Gate',
    description: 'Automation Proficient — can you work at scale?',
    criteria: [
      {
        label: 'Terraform Associate 003 certified ✓',
        icon: 'i-simple-icons-terraform',
        color: 'text-violet-400',
        detail: {
          why: 'HashiCorp Terraform Associate 003 validates professional IaC usage including state management, modules, backends, and the Terraform Cloud workflow. Increasingly listed as required in DevOps and cloud platform engineering job descriptions.',
          milestone: 'Pass the Terraform Associate 003 (~57 questions, 60 min, PSI testing, pass/fail). HashiCorp Credly badge posted to LinkedIn.',
          topics: [
            'IaC concepts: immutable vs mutable infrastructure, declarative vs imperative, idempotency',
            'Terraform vs Pulumi (imperative), CloudFormation (AWS-only), Ansible (config management) — exam tests conceptual differences',
            'Core workflow: Write → init → validate → plan → apply → destroy',
            'State: purpose, local vs remote, locking (DynamoDB), what happens without locking (race conditions)',
            'Terraform Cloud / HCP Terraform: remote execution, workspaces, variable sets, speculative plans, Sentinel policy-as-code overview',
            'Modules: all sources (local, public registry, GitHub), version pinning (~> 3.14), inputs/outputs across module boundary',
            'Built-in functions for exam: min(), max(), lookup(map, key, default), merge(), flatten(), tomap(), tolist(), file(), templatefile()',
            'Meta-arguments: count with count.index, for_each with each.key/each.value, depends_on, provider aliasing, lifecycle options',
            'Provisioners: local-exec, remote-exec — exam tests that you know they\'re a last resort; Terraform cannot guarantee their success',
            'Import: terraform import ADDRESS ID — brings existing infra under Terraform management (state only; config must be written manually)',
            'Backends: S3, Terraform Cloud, partial configuration pattern for security',
            'Workspaces: terraform workspace new/select/list; different state file per workspace; terraform.workspace interpolation',
            'Debugging: TF_LOG=DEBUG terraform plan; log levels TRACE/DEBUG/INFO/WARN/ERROR; TF_LOG_PATH for file output',
            'Sensitive values: sensitive = true on variable and output; values still appear in state — always encrypt state at rest',
            'terraform taint deprecated since 1.0 — replaced by terraform apply -replace=ADDRESS'
          ],
          tips: [
            'Exam tests conceptual understanding, not memorised syntax — focus on why Terraform makes each design decision',
            'Build two modules before the exam: one simple (reusable security group), one nested (VPC with subnet and route table submodules)',
            'Practice HCP Terraform free tier: create a workspace, link GitHub repo, trigger speculative plan, then remote apply',
            'Exam cost ~USD 70 via HashiCorp certification portal; pass/fail result appears immediately after submission',
            'Use Bryan Krausen\'s Udemy practice exams — cover edge cases like taint deprecation that the official study guide skips'
          ],
          resources: [
            { name: 'Terraform Associate 003 — Official Exam Guide', url: 'https://developer.hashicorp.com/terraform/tutorials/certification-003/associate-review-003' },
            { name: 'HashiCorp Learn — Terraform Associate Study Guide', url: 'https://developer.hashicorp.com/terraform/tutorials/certification-003/associate-study-003' },
            { name: 'Bryan Krausen — Terraform Associate Practice Exams (Udemy)', url: 'https://www.udemy.com/course/terraform-associate-practice-exam/' },
            { name: 'Terraform Registry — Browse Providers and Modules', url: 'https://registry.terraform.io/' }
          ]
        }
      },
      {
        label: 'Kubernetes basics: Pods, Deployments, Services on EKS — documented GitHub repo',
        icon: 'i-simple-icons-kubernetes',
        color: 'text-blue-500',
        detail: {
          why: 'Kubernetes is the de facto container orchestration standard. EKS appears in most cloud engineering job descriptions at companies running microservices. Month 9 hands-on experience builds the foundation for the CKA at Month 10.',
          milestone: 'Public GitHub repo with Kubernetes manifests deploying a multi-tier app (not just nginx) to EKS, documented README with kubectl output screenshots and eksctl cluster creation command used.',
          topics: [
            'Pod: smallest deployable unit — containers sharing network namespace, storage volumes, lifecycle',
            'ReplicaSet: maintains desired Pod count; managed by Deployments (rarely created directly)',
            'Deployment: manages ReplicaSets, rolling updates, rollback, pause/resume',
            'Service types: ClusterIP (cluster-internal DNS), NodePort (node IP + static port), LoadBalancer (AWS ELB/NLB), ExternalName (CNAME)',
            'Namespace: virtual cluster for isolation, resource quota scoping, network policy scope',
            'ConfigMap: non-sensitive config as key-value pairs or file content, mounted as volumes or env vars',
            'Secret: base64-encoded data; in production use External Secrets Operator + AWS Secrets Manager (not etcd storage)',
            'PV/PVC/StorageClass: dynamic provisioning with EBS CSI Driver gp3 StorageClass on EKS',
            'Ingress: HTTP/HTTPS routing (host/path-based); requires AWS Load Balancer Controller for ALB on EKS',
            'Resource requests and limits: requests.cpu in millicores (250m = 0.25 CPU), requests.memory in Mi/Gi; limits trigger OOMKill',
            'Health probes: livenessProbe (restart if fails), readinessProbe (remove from endpoints if fails), startupProbe (for slow-starting apps)',
            'DaemonSet: one Pod per node — for log collectors, monitoring agents (amazon-cloudwatch-agent)',
            'EKS setup: eksctl create cluster --name my-cluster --region us-east-1 --nodegroup-name ng-1 --node-type t3.medium --nodes 2',
            'IRSA (IAM Roles for Service Accounts): IAM role + ServiceAccount annotation — pods get AWS credentials via projected token, no access keys in pods',
            'aws-auth ConfigMap: maps IAM user/role ARNs to Kubernetes usernames for cluster access',
            'AWS Load Balancer Controller: provisions ALB for Ingress, NLB for LoadBalancer services',
            'EKS Add-ons: CoreDNS, kube-proxy, VPC CNI (aws-node), EBS CSI Driver',
            'Key kubectl commands: get/describe/logs/exec/apply/delete/scale/rollout/port-forward/top'
          ],
          resources: [
            { name: 'Kubernetes Official Documentation', url: 'https://kubernetes.io/docs/home/' },
            { name: 'Amazon EKS User Guide', url: 'https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html' },
            { name: 'eksctl Documentation', url: 'https://eksctl.io/' },
            { name: 'TechWorld with Nana — Kubernetes Full Course (YouTube, 4h)', url: 'https://www.youtube.com/watch?v=X48VuDVv0do' },
            { name: 'AWS EKS Workshop — Hands-On Labs', url: 'https://www.eksworkshop.com/' },
            { name: 'KodeKloud — Kubernetes for Absolute Beginners', url: 'https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners-hands-on/' }
          ]
        }
      },
      {
        label: 'CI/CD pipeline built with GitHub Actions — deploys to AWS automatically',
        icon: 'i-simple-icons-githubactions',
        color: 'text-neutral-300',
        detail: {
          why: 'Every cloud team uses CI/CD. Building a working pipeline proves you understand the software delivery lifecycle — not just the infrastructure side. GitHub Actions is free for public repos and the most common CI tool in modern cloud shops.',
          milestone: 'A GitHub Actions workflow that runs on push/PR, executes lint + test, and deploys to AWS — no manual steps. Documented in the repo README with a workflow status badge.',
          topics: [
            'Workflow file: .github/workflows/deploy.yml — YAML anatomy: name, on (trigger), jobs, steps',
            'Triggers: on: push: branches: [main], on: pull_request: branches: [main], on: workflow_dispatch (manual), on: schedule: cron: \'0 8 * * 1\'',
            'Jobs and steps: jobs.<job_id>.runs-on: ubuntu-latest; steps: - uses: (action), - run: (shell command)',
            'Actions: actions/checkout@v4, actions/setup-python@v5, actions/setup-node@v4, aws-actions/configure-aws-credentials@v4',
            'Environment variables: ${{ env.MY_VAR }}, ${{ vars.CONFIG_VAR }} (repo vars), ${{ secrets.SECRET_NAME }} (encrypted secrets)',
            'Contexts: ${{ github.sha }}, ${{ github.ref_name }}, ${{ github.actor }}, ${{ github.event_name }}',
            'Conditional steps: if: github.ref == \'refs/heads/main\' (deploy only on main); if: failure() (run on failure for notifications)',
            'OIDC auth (preferred over IAM keys): permissions: id-token: write; aws-actions/configure-aws-credentials with role-to-assume — no long-lived credentials stored in secrets',
            'Matrix strategy: strategy: matrix: python-version: [3.11, 3.12] — run jobs across multiple versions in parallel',
            'Artifacts: actions/upload-artifact and actions/download-artifact — pass build outputs between jobs',
            'Caching: actions/cache@v4 with key/restore-keys for pip, npm, Terraform plugin cache',
            'Deploy patterns: ECR push + ECS task definition update, Lambda zip upload via aws cli, EKS kubectl apply, S3 sync + CloudFront invalidation, Terraform init/plan/apply',
            'Environments: jobs.<id>.environment: production — required reviewers gate for production deploys',
            'Branch protection: require passing status checks before merge to main — enforces the CI gate'
          ],
          tips: [
            'Use OIDC instead of IAM access keys in GitHub Secrets — it\'s more secure, no credential rotation needed, and increasingly expected in interviews',
            'Add a workflow status badge to your README: ![CI](https://github.com/{user}/{repo}/actions/workflows/deploy.yml/badge.svg)',
            'Use job outputs (${{ needs.build.outputs.image_tag }}) to pass the Docker image tag from the build job to the deploy job',
            'Cache your dependencies (pip, npm, Terraform plugins) — it cuts pipeline time by 60-80% and shows you care about developer experience',
            'Add a drift detection workflow: schedule: cron that runs `terraform plan` nightly and posts Slack/email if drift is detected'
          ],
          resources: [
            { name: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions' },
            { name: 'aws-actions/configure-aws-credentials (OIDC)', url: 'https://github.com/aws-actions/configure-aws-credentials' },
            { name: 'GitHub Actions Marketplace', url: 'https://github.com/marketplace?type=actions' },
            { name: 'GitHub Actions for AWS — Workshop', url: 'https://catalog.workshops.aws/github-actions-on-aws/en-US' },
            { name: 'act — Run GitHub Actions Locally', url: 'https://github.com/nektos/act' }
          ]
        }
      },
      {
        label: '3 portfolio projects with written case studies published',
        icon: 'i-lucide-file-text',
        color: 'text-yellow-400',
        detail: {
          why: 'Three documented projects is the threshold where a portfolio starts feeling like a track record rather than a single lucky build. Interviewers will pick one to probe deeply — you need to be able to answer any question about all three.',
          milestone: '3 projects on portfolio site with full case studies. Each linked from GitHub profile. Architecture diagrams included. URLs shared on LinkedIn profile Featured section.',
          steps: [
            '1. Project 1 (Month 3): Static site on S3 + CloudFront + Route53 — document architecture, cost, and how you secured the bucket with OAC',
            '2. Project 2 (Month 6): Terraform-provisioned VPC or Python boto3 CLI tool — include the GitHub Actions CI/CD pipeline that deploys it',
            '3. Project 3 (Month 9): Kubernetes workload on EKS — multi-tier app, Deployment + Service + Ingress manifests, IRSA for AWS access',
            '4. Each case study format: Problem (1 para) → Architecture diagram → Key decisions with rationale → Implementation challenges → Outcome/metrics → What I would change',
            '5. Add a "stack" badge row under each project title: AWS · Terraform · Python · Kubernetes · GitHub Actions',
            '6. Cloud Resume Challenge as Project 1 alternative: S3 + CloudFront + Lambda + DynamoDB + API Gateway — employer-recognised, covers the most SAA-relevant services'
          ],
          resources: [
            { name: 'Cloud Resume Challenge (highly recommended)', url: 'https://cloudresumechallenge.dev/' },
            { name: 'diagrams.net — Architecture Diagrams', url: 'https://www.diagrams.net/' },
            { name: 'AWS Architecture Icons', url: 'https://aws.amazon.com/architecture/icons/' }
          ]
        }
      },
      {
        label: 'Actively interviewing — ≥3 screening calls completed',
        icon: 'i-lucide-phone',
        color: 'text-emerald-400',
        detail: {
          why: 'Three completed screening calls by Month 9 means you have live market feedback on how employers evaluate your background, which questions come up repeatedly, and what gaps you still need to close before Month 10.',
          milestone: '3+ screening calls logged in your job tracker with: company, date, recruiter/interviewer, topics covered, feedback received, next steps.',
          tracking: [
            'After every screening: write down the 3 questions you found hardest — they reveal exactly what to improve',
            'Pattern recognition: if 3 different companies ask "do you have production Kubernetes experience?" that\'s a signal to prioritise EKS hands-on labs',
            'Technical screens at Month 9: expect Linux basics, AWS services scenario questions, "walk me through a project" for each GitHub repo',
            'Behavioural questions to prepare: "Tell me about a time you had to learn something quickly", "Describe a project where things went wrong"',
            'Research each company before screening: read their engineering blog, check their GitHub org, know which AWS services they use',
            'Follow up within 24h with a thank-you email and one specific thing you took away from the conversation'
          ]
        }
      }
    ]
  },
  {
    month: 10,
    title: 'Month 10 — Final Stretch',
    description: 'Job-ready decision point',
    criteria: [
      {
        label: 'CKA exam booked — date confirmed, killer.sh access activated',
        icon: 'i-simple-icons-kubernetes',
        color: 'text-blue-500',
        detail: {
          why: 'The CKA (Certified Kubernetes Administrator) is a performance-based, hands-on exam — no multiple choice. It\'s the most respected Kubernetes credential and increasingly mandatory for senior cloud/platform engineering roles. Booking the date creates a deadline that forces preparation.',
          milestone: 'CKA exam date booked via training.linuxfoundation.org. Both killer.sh simulation sessions activated and at least one completed with ≥70% score.',
          topics: [
            'Exam format: 2 hours, browser-based terminal, ~15-20 performance tasks, ~66% pass rate, USD 395 (includes one free retake + 2 killer.sh simulator sessions)',
            'Domain 1 — Storage (10%): PV, PVC, StorageClass, dynamic provisioning, access modes (RWO, ROX, RWX), reclaim policies',
            'Domain 2 — Troubleshooting (30%): Debug failing pods, crashlooping containers, node NotReady, network connectivity issues, check kubelet/kube-apiserver logs',
            'Domain 3 — Workloads & Scheduling (15%): Deployment strategies, DaemonSet, StatefulSet, Jobs, CronJobs, resource limits, taints/tolerations, node affinity, pod disruption budgets',
            'Domain 4 — Cluster Architecture, Installation & Configuration (25%): kubeadm init/join, etcd backup and restore (etcdctl snapshot), upgrade a cluster (kubeadm upgrade), RBAC (Role/ClusterRole/Binding), ServiceAccount',
            'Domain 5 — Services & Networking (20%): NetworkPolicy (allow/deny traffic between pods/namespaces), CNI plugins, Ingress, DNS (CoreDNS), kube-proxy modes',
            'Must-know commands: kubectl create/apply/delete/get/describe/logs/exec/cp/port-forward/top/rollout/scale/set image',
            'etcd backup: ETCDCTL_API=3 etcdctl snapshot save /backup/snapshot.db --endpoints=https://127.0.0.1:2379 --cacert= --cert= --key=',
            'RBAC: kubectl create role pod-reader --verb=get,list,watch --resource=pods; kubectl create rolebinding; kubectl auth can-i',
            'NetworkPolicy: spec.podSelector + ingress/egress rules with podSelector, namespaceSelector, ipBlock',
            'Exam tips: use kubectl explain, use --dry-run=client -o yaml to generate manifests quickly, alias k=kubectl, set autocomplete',
            'Time management: ~6 minutes per task average; flag and skip hard tasks, return at the end'
          ],
          tips: [
            'Do both killer.sh sessions: first one to benchmark your weaknesses, second one 3-5 days before the exam as a final dress rehearsal',
            'Practice etcd backup and restore from scratch at least 5 times until it\'s muscle memory — it appears in most CKA attempts',
            'Set up aliases before starting tasks: alias k=kubectl; complete -F __start_kubectl k; export do=\'--dry-run=client -o yaml\'',
            'kubeadm cluster upgrade is always in the exam: know the sequence (upgrade control plane → drain worker nodes → upgrade kubelet/kubectl on workers → uncordon)',
            'Killer.sh is harder than the real exam by design — if you score 70%+ on killer.sh, you\'re ready'
          ],
          resources: [
            { name: 'CKA Exam Registration — Linux Foundation', url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/' },
            { name: 'killer.sh CKA Simulator (included with exam purchase)', url: 'https://killer.sh/' },
            { name: 'Mumshad Mannambeth — CKA with Practice Tests (KodeKloud)', url: 'https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/' },
            { name: 'Kubernetes Documentation (the only allowed resource during exam)', url: 'https://kubernetes.io/docs/' },
            { name: 'KodeKloud CKA Labs', url: 'https://kodekloud.com/courses/certified-kubernetes-administrator-cka/' }
          ]
        }
      },
      {
        label: 'Salary target defined — KES minimum, ideal, and USD remote equivalent',
        icon: 'i-lucide-wallet',
        color: 'text-emerald-400',
        detail: {
          why: 'Entering salary negotiation without a number is the single most expensive mistake in a job search. Knowing your floor and ideal before the conversation means you never accept below your market rate under pressure.',
          milestone: 'Written salary targets documented: KES minimum (won\'t go below), KES ideal (what you\'re targeting), USD remote equivalent, and your rationale for each figure.',
          topics: [
            'Kenya cloud market ranges (2024-2025 data — BrighterMonday, Glassdoor Kenya, LinkedIn Salary):',
            'Entry-level Cloud/DevOps Engineer (0-2 yrs): KES 80,000 – 120,000/month gross',
            'Junior Cloud Engineer (2-4 yrs, certified): KES 120,000 – 180,000/month gross',
            'Mid-level Cloud/Platform Engineer (4-6 yrs): KES 180,000 – 350,000/month gross',
            'USD remote roles (full-time, international companies with Kenyan presence): USD 30,000 – 70,000/year gross ≈ KES 3.9M – 9.1M/year',
            'Negotiation floor = your current take-home × 1.2 minimum (20% increase for any career move)',
            'Total compensation: consider health insurance (private cover), pension/NSSF contribution, leave days, remote flexibility, training budget, AWS certification reimbursement',
            'Research tools: LinkedIn Salary (use VPN to compare to US/UK rates), Glassdoor (glassdoor.co.ke), BrighterMonday Salary Guide, ITJobsWatch UK (benchmark for remote)',
            'Negotiation approach: always give a range, not a single number; anchor high (your ideal); never reveal your current salary unless legally required',
            'Counter-offer timing: respond to any offer within 24-48 hours; always counteroffer at least once — employers expect it and rarely withdraw offers'
          ]
        }
      },
      {
        label: 'CV reviewed by 2+ cloud professionals — ATS-optimised',
        icon: 'i-lucide-file-check',
        color: 'text-blue-400',
        detail: {
          why: 'A CV reviewed only by the person who wrote it contains blind spots invisible to the author. Cloud professionals spot missing keywords, unclear project descriptions, and credential ordering issues that automated screening systems and hiring managers both trip on.',
          milestone: 'CV reviewed by 2 cloud engineers or hiring managers, ATS score ≥70% on jobscan.co, and a PDF version that passes the "30-second scan" test — certification and GitHub URL visible in the top third.',
          topics: [
            'ATS-safe format: single column, no tables/columns/text boxes/headers-as-images, .docx or ATS-safe PDF, standard section headers (Experience, Education, Certifications, Skills)',
            'Transitioner CV section order: Summary → Certifications → Skills → Projects (prioritised) → Work Experience → Education',
            'Summary: 3 sentences — current role + transition context + what you\'re seeking; example: "Cloud Engineering candidate with AWS SAA-C03 certification, transitioning into cloud infrastructure roles. Hands-on with Terraform, Docker, and Python automation projects. Seeking a junior cloud or DevOps role where I can apply Terraform and Kubernetes skills."',
            'Certifications section: AWS SAA-C03 (June 2026), Terraform Associate 003 (Aug 2026) — always include the date passed and expiry',
            'Skills section: Cloud (AWS — EC2, S3, VPC, Lambda, RDS, CloudFront) | IaC (Terraform, CloudFormation) | Containers (Docker, Kubernetes, EKS) | Languages (Python, Bash) | CI/CD (GitHub Actions)',
            'Project bullets: use "Built X using Y, resulting in Z" format — always a verb, a technology, and an outcome or scale metric',
            'Experience bullets: convert existing experience to cloud-relevant framing — highlight automation, scripting, infrastructure, or systems you managed; quantify impact (users served, uptime %, cost saved)',
            'Find reviewers: AWS User Group Kenya, local tech Slack communities, LinkedIn connections in cloud roles, ADPList.org (free mentorship platform)',
            'jobscan.co: paste your CV and the job description; score ≥70% means your keywords match ATS filters',
            'File naming: Belinze_Newtone_Cloud_Engineer_CV.pdf — not "CV.pdf" or "Resume_Final_v3.pdf"'
          ],
          resources: [
            { name: 'Jobscan — ATS Optimisation Tool', url: 'https://www.jobscan.co/' },
            { name: 'ADPList — Free Mentorship from Cloud Engineers', url: 'https://adplist.org/' },
            { name: 'AWS User Group Kenya', url: 'https://www.linkedin.com/groups/12469963/' }
          ]
        }
      },
      {
        label: 'LinkedIn profile optimised to All-Star — headline, about, featured, Open to Work',
        icon: 'i-simple-icons-linkedin',
        color: 'text-blue-500',
        detail: {
          why: 'Recruiters find candidates through LinkedIn search — a profile that doesn\'t reach "All Star" status is ranked lower in LinkedIn\'s search results. Cloud engineering recruiters search by certification name, technology, and location.',
          milestone: 'Profile reaches All-Star status (LinkedIn shows this indicator), Open to Work activated for recruiters only, and at least 3 recommendations from colleagues or mentors.',
          topics: [
            'All-Star requirements: Profile photo, Background image, Headline (120 chars), Location, Industry, Current position with description, Education, 5+ Skills, 50+ Connections',
            'Headline format: "Junior Cloud Engineer | AWS SAA-C03 | Terraform | Kubernetes | Open to Cloud/DevOps roles in Nairobi & Remote" — pack keywords, not job titles',
            'About section (2,000 chars): Start with your transition story (2 sentences), what you\'ve built (3 specific project mentions), what you\'re seeking and where, contact invitation',
            'Featured section: pin your portfolio site URL, GitHub profile, best project link, or a published article — this is prime recruiter real estate',
            'Experience: add cloud-specific bullet points to your existing role — automation, scripting, infrastructure management you actually did',
            'Certifications section: add AWS SAA-C03 and Terraform Associate with exact dates and credential IDs (from Credly)',
            'Skills: add AWS, Terraform, Kubernetes, Python, Docker, Linux, CI/CD, GitHub Actions — these are recruiter search keywords',
            'Creator Mode: enable to get a Follow button instead of Connect — useful if you plan to post about your learning journey (increases profile visibility)',
            'Open to Work: use "Recruiters only" to avoid alerting current employer; set role types to Cloud Engineer, DevOps Engineer, Infrastructure Engineer, Platform Engineer',
            'Custom URL: linkedin.com/in/belinze-newtone — remove the default numbers',
            'Activity: comment on 3-5 posts per week in cloud/DevOps spaces — profile views increase significantly with consistent activity'
          ]
        }
      },
      {
        label: 'Offer in hand or active final-round interviews — Month 10 outcome',
        icon: 'i-lucide-trophy',
        color: 'text-yellow-400',
        detail: {
          why: 'Month 10 is the decision point of the 12-month sprint. An offer or a live final-round process by this point means the transition is working. If neither exists, it\'s an early signal to adjust the strategy in Months 11-12 rather than discovering the gap at Month 12.',
          milestone: 'At least one written offer or one active final-round interview process (technical interview completed, waiting for decision or final stage).',
          tracking: [
            'If no offers yet: audit your job tracker — how many applications? What\'s your CV-to-screening conversion rate? (target: ≥15%)',
            'If getting screenings but no technical invites: the CV is passing but something in screening is failing — record every screening and find the pattern',
            'If failing technical interviews: identify which topics keep coming up and schedule focused practice sessions (KodeKloud, LeetCode for algorithms, AWS scenario questions)',
            'Negotiation: when an offer comes, take 24-48 hours, thank them genuinely, counter with your ideal number and a justification (certifications, project work, market research)',
            'Multiple offers: tell each company politely that you have competing offers and ask if they can accelerate their timeline — competition creates urgency',
            'Red flags to walk away from: below KES 80k gross, no remote flexibility for junior role in 2025, no training budget, no clear growth path explained by manager in interview'
          ]
        }
      }
    ]
  }
]

// ── DB interaction ───────────────────────────────────────────────────────────

type Checkpoint = { id: string; month: number; status: string; criteria_met: boolean[]; completed_date: string | null; notes: string | null }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any

const { data: checkpointData, refresh } = useAsyncData('checkpoints', async () => {
  const { data } = await sb.from('checkpoints').select('*')
  return (data ?? []) as Checkpoint[]
})

function getCheckpoint(month: number) {
  return (checkpointData.value ?? []).find(c => c.month === month)
}

function criteriaChecked(month: number, idx: number) {
  return getCheckpoint(month)?.criteria_met?.[idx] ?? false
}

async function toggleCriteria(month: number, idx: number) {
  const cp = getCheckpoint(month)
  const gate = GATES.find(g => g.month === month)!
  const current = cp?.criteria_met ?? gate.criteria.map(() => false)
  const updated = [...current]
  updated[idx] = !updated[idx]

  if (cp) {
    const all_met = updated.every(Boolean)
    await sb.from('checkpoints').update({
      criteria_met: updated,
      status: all_met ? 'completed' : 'in_progress',
      completed_date: all_met ? new Date().toISOString().split('T')[0] : null
    }).eq('id', cp.id)
  } else {
    await sb.from('checkpoints').insert({ month, criteria_met: updated, status: 'in_progress' })
  }
  await refresh()
}

function gateProgress(month: number, gate: typeof GATES[0]) {
  const cp = getCheckpoint(month)
  const checked = (cp?.criteria_met ?? []).filter(Boolean).length
  return Math.round((checked / gate.criteria.length) * 100)
}

const statusColor = (month: number) => {
  const cp = getCheckpoint(month)
  if (!cp) return 'neutral'
  if (cp.status === 'completed') return 'success'
  if (cp.status === 'in_progress') return 'info'
  return 'neutral'
}

// ── Accordion state ───────────────────────────────────────────────────────────
const openItems = ref<Set<string>>(new Set())
function toggleItem(key: string) {
  const next = new Set(openItems.value)
  next.has(key) ? next.delete(key) : next.add(key)
  openItems.value = next
}
function isOpen(key: string) { return openItems.value.has(key) }

// ── Sub-item checkboxes (localStorage, no DB change needed) ───────────────────
const STORAGE_KEY = 'cloudos-checkpoint-subitems'

const subChecks = ref<Record<string, boolean>>({})

onMounted(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) subChecks.value = JSON.parse(stored)
  } catch {}
})

function isSubChecked(key: string) { return !!subChecks.value[key] }

function toggleSub(key: string) {
  subChecks.value = { ...subChecks.value, [key]: !subChecks.value[key] }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(subChecks.value)) } catch {}
}
</script>

<template>
  <div class="space-y-6 max-w-3xl">
    <div>
      <h1 class="text-xl font-bold">Checkpoint Gates</h1>
      <p class="text-sm text-muted-foreground mt-1">Month 3 · 6 · 9 · 10 — cross each gate before advancing</p>
    </div>

    <div class="grid gap-6">
      <div
        v-for="gate in GATES"
        :key="gate.month"
        class="rounded-xl border border-border bg-card overflow-hidden"
      >
        <!-- Gate header -->
        <div class="p-5 flex items-start justify-between gap-4">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono text-muted-foreground">MONTH {{ gate.month }}</span>
              <UBadge :color="statusColor(gate.month)" size="xs">
                {{ getCheckpoint(gate.month)?.status?.replace('_', ' ') ?? 'not started' }}
              </UBadge>
            </div>
            <h3 class="font-bold text-foreground">{{ gate.title }}</h3>
            <p class="text-xs text-muted-foreground">{{ gate.description }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-2xl font-bold text-foreground">{{ gateProgress(gate.month, gate) }}%</p>
            <p class="text-[10px] text-muted-foreground uppercase">complete</p>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="h-1 bg-muted">
          <div
            class="h-full transition-all duration-500"
            :class="gateProgress(gate.month, gate) === 100 ? 'bg-emerald-500' : 'bg-primary'"
            :style="{ width: gateProgress(gate.month, gate) + '%' }"
          />
        </div>

        <!-- Criteria list -->
        <div class="divide-y divide-border">
          <div
            v-for="(criterion, idx) in gate.criteria"
            :key="idx"
          >
            <!-- Row -->
            <div class="flex items-center gap-3 px-5 py-3.5">
              <!-- Checkbox -->
              <input
                type="checkbox"
                :checked="criteriaChecked(gate.month, idx)"
                class="accent-primary shrink-0 h-4 w-4 cursor-pointer"
                @change="toggleCriteria(gate.month, idx)"
              >

              <!-- Icon + label -->
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <UIcon :name="criterion.icon" :class="['h-4 w-4 shrink-0', criterion.color]" />
                <span
                  :class="[
                    'text-sm leading-snug',
                    criteriaChecked(gate.month, idx) ? 'line-through text-muted-foreground' : 'text-foreground'
                  ]"
                >
                  {{ criterion.label }}
                </span>
              </div>

              <!-- Expand toggle (only if criterion has detail) -->
              <button
                v-if="(criterion as any).detail"
                class="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                @click="toggleItem(`${gate.month}-${idx}`)"
              >
                <UIcon
                  :name="isOpen(`${gate.month}-${idx}`) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  class="h-4 w-4"
                />
              </button>
            </div>

            <!-- Detail panel -->
            <Transition name="slide">
              <div
                v-if="isOpen(`${gate.month}-${idx}`) && (criterion as any).detail"
                class="border-t border-border/50 bg-muted/20 px-5 py-4 space-y-5"
              >
                <!-- Why -->
                <div class="flex gap-2 rounded-lg bg-primary/5 border border-primary/10 p-3">
                  <UIcon name="i-lucide-lightbulb" class="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p class="text-xs text-foreground/80 leading-relaxed">{{ (criterion as any).detail.why }}</p>
                </div>

                <!-- Milestone -->
                <div v-if="(criterion as any).detail.milestone" class="flex gap-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                  <UIcon name="i-lucide-flag" class="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p class="text-xs text-emerald-400 leading-relaxed font-medium">{{ (criterion as any).detail.milestone }}</p>
                </div>

                <!-- AWS Domains -->
                <div v-if="(criterion as any).detail.domains">
                  <p class="text-xs font-semibold text-foreground mb-3">Exam Domains</p>
                  <div class="grid gap-3">
                    <div
                      v-for="(domain, di) in (criterion as any).detail.domains"
                      :key="domain.name"
                      class="rounded-lg border border-border bg-card p-3 space-y-2"
                    >
                      <div class="flex items-center justify-between">
                        <p class="text-xs font-semibold text-foreground">{{ domain.name }}</p>
                        <UBadge color="warning" size="xs">{{ domain.weight }}</UBadge>
                      </div>
                      <ul class="space-y-1.5">
                        <li
                          v-for="(topic, ti) in domain.topics"
                          :key="topic"
                          class="flex items-start gap-2 cursor-pointer group"
                          @click="toggleSub(`${gate.month}-${idx}-domain-${di}-${ti}`)"
                        >
                          <input
                            type="checkbox"
                            :checked="isSubChecked(`${gate.month}-${idx}-domain-${di}-${ti}`)"
                            class="accent-primary shrink-0 mt-0.5 h-3 w-3 pointer-events-none"
                            readonly
                          >
                          <span :class="['text-[11px] leading-snug', isSubChecked(`${gate.month}-${idx}-domain-${di}-${ti}`) ? 'line-through text-muted-foreground/50' : 'text-muted-foreground']">{{ topic }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Pro tips (AWS) -->
                <div v-if="(criterion as any).detail.tips">
                  <p class="text-xs font-semibold text-foreground mb-2">Pro Tips</p>
                  <ul class="space-y-1.5">
                    <li
                      v-for="tip in (criterion as any).detail.tips"
                      :key="tip"
                      class="text-[11px] text-muted-foreground flex gap-2"
                    >
                      <UIcon name="i-lucide-zap" class="h-3 w-3 text-yellow-400 shrink-0 mt-0.5" />
                      {{ tip }}
                    </li>
                  </ul>
                </div>

                <!-- Generic topics list -->
                <div v-if="(criterion as any).detail.topics">
                  <p class="text-xs font-semibold text-foreground mb-2">Topics to Cover</p>
                  <ul class="space-y-1.5">
                    <li
                      v-for="(topic, ti) in (criterion as any).detail.topics"
                      :key="topic"
                      class="flex items-start gap-2 cursor-pointer"
                      @click="toggleSub(`${gate.month}-${idx}-topic-${ti}`)"
                    >
                      <input
                        type="checkbox"
                        :checked="isSubChecked(`${gate.month}-${idx}-topic-${ti}`)"
                        class="accent-primary shrink-0 mt-0.5 h-3 w-3 pointer-events-none"
                        readonly
                      >
                      <span :class="['text-[11px] leading-snug', isSubChecked(`${gate.month}-${idx}-topic-${ti}`) ? 'line-through text-muted-foreground/50' : 'text-muted-foreground']">{{ topic }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Scripts (Bash) -->
                <div v-if="(criterion as any).detail.scripts">
                  <p class="text-xs font-semibold text-foreground mb-2">Required Scripts</p>
                  <ul class="space-y-1.5">
                    <li
                      v-for="(script, si) in (criterion as any).detail.scripts"
                      :key="script"
                      class="flex items-start gap-2 cursor-pointer"
                      @click="toggleSub(`${gate.month}-${idx}-script-${si}`)"
                    >
                      <input
                        type="checkbox"
                        :checked="isSubChecked(`${gate.month}-${idx}-script-${si}`)"
                        class="accent-primary shrink-0 mt-0.5 h-3 w-3 pointer-events-none"
                        readonly
                      >
                      <span :class="['text-[11px] leading-snug', isSubChecked(`${gate.month}-${idx}-script-${si}`) ? 'line-through text-muted-foreground/50' : 'text-muted-foreground']">{{ script }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Steps (Cloud project) -->
                <div v-if="(criterion as any).detail.steps">
                  <p class="text-xs font-semibold text-foreground mb-2">Step-by-Step</p>
                  <ul class="space-y-1.5">
                    <li
                      v-for="(step, si) in (criterion as any).detail.steps"
                      :key="step"
                      class="flex items-start gap-2 cursor-pointer"
                      @click="toggleSub(`${gate.month}-${idx}-step-${si}`)"
                    >
                      <input
                        type="checkbox"
                        :checked="isSubChecked(`${gate.month}-${idx}-step-${si}`)"
                        class="accent-primary shrink-0 mt-0.5 h-3 w-3 pointer-events-none"
                        readonly
                      >
                      <span :class="['text-[11px] leading-snug', isSubChecked(`${gate.month}-${idx}-step-${si}`) ? 'line-through text-muted-foreground/50' : 'text-muted-foreground']">{{ step }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Alternatives -->
                <div v-if="(criterion as any).detail.alternatives">
                  <p class="text-xs font-semibold text-foreground mb-2">Alternatives</p>
                  <ul class="space-y-1.5">
                    <li
                      v-for="alt in (criterion as any).detail.alternatives"
                      :key="alt"
                      class="text-[11px] text-muted-foreground flex gap-2"
                    >
                      <UIcon name="i-lucide-arrow-right" class="h-3 w-3 text-purple-400 shrink-0 mt-0.5" />
                      {{ alt }}
                    </li>
                  </ul>
                </div>

                <!-- Tracking tips (daily log) -->
                <div v-if="(criterion as any).detail.tracking">
                  <p class="text-xs font-semibold text-foreground mb-2">How to Stay Consistent</p>
                  <ul class="space-y-1.5">
                    <li
                      v-for="(tip, ti) in (criterion as any).detail.tracking"
                      :key="tip"
                      class="flex items-start gap-2 cursor-pointer"
                      @click="toggleSub(`${gate.month}-${idx}-track-${ti}`)"
                    >
                      <input
                        type="checkbox"
                        :checked="isSubChecked(`${gate.month}-${idx}-track-${ti}`)"
                        class="accent-primary shrink-0 mt-0.5 h-3 w-3 pointer-events-none"
                        readonly
                      >
                      <span :class="['text-[11px] leading-snug', isSubChecked(`${gate.month}-${idx}-track-${ti}`) ? 'line-through text-muted-foreground/50' : 'text-muted-foreground']">{{ tip }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Resources -->
                <div v-if="(criterion as any).detail.resources">
                  <p class="text-xs font-semibold text-foreground mb-2">Resources</p>
                  <div class="flex flex-wrap gap-2">
                    <a
                      v-for="res in (criterion as any).detail.resources"
                      :key="res.url"
                      :href="res.url"
                      target="_blank"
                      rel="noopener"
                      class="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] text-primary hover:bg-primary/5 transition-colors"
                    >
                      <UIcon name="i-lucide-external-link" class="h-3 w-3" />
                      {{ res.name }}
                    </a>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Gate cleared -->
        <div v-if="getCheckpoint(gate.month)?.completed_date" class="px-5 py-3 bg-emerald-500/5 border-t border-emerald-500/20 flex items-center gap-2">
          <UIcon name="i-lucide-check-circle" class="h-4 w-4 text-emerald-500" />
          <p class="text-xs text-emerald-400">Gate cleared {{ getCheckpoint(gate.month)?.completed_date }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
