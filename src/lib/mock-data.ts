// Single source of mock data for the whole app. Illustrative sample data only.

export type CourseStatus = 'verified' | 'generating' | 'verifying' | 'review' | 'failed' | 'draft';
export type Level = 'Beginner' | 'Intermediate' | 'Advanced';
export type SnippetStatus = 'queued' | 'running' | 'passed' | 'failed' | 'retrying';

export interface Course {
  id: string;
  title: string;
  description: string;
  language: 'Java' | 'Python' | 'React' | 'Docker' | 'Node.js' | 'SQL' | 'TypeScript' | 'Kubernetes' | 'Git';
  runtime: string;
  level: Level;
  durationMin: number;
  slides: number;
  snippets: { passed: number; total: number };
  status: CourseStatus;
  statusNote?: string;
  version: number;
  updatedAt: string;
  createdAt: string;
  coverage: number;
  tags: string[];
  accent: [string, string];
}

const daysAgo = (d: number, h = 0) => new Date(Date.now() - d * 864e5 - h * 36e5).toISOString();

export const currentUser = {
  name: 'Aarav Mehta',
  firstName: 'Aarav',
  email: 'aarav.mehta@techsummit.edu',
  role: 'Trainer',
  institute: 'TechSummit Institute',
  initials: 'AM',
  phone: '+91 98765 43210',
  bio: 'Senior Java & Spring trainer. 9 years teaching backend engineering.',
};

export const runtimes = [
  { id: 'java-21', label: 'Java 21.0.2', language: 'Java', image: 'eclipse-temurin:21.0.2_13-jdk', deps: ['JUnit 5.10.2', 'AssertJ 3.25.3'] },
  { id: 'java-11', label: 'Java 11.0.22', language: 'Java', image: 'eclipse-temurin:11.0.22_7-jdk', deps: ['JUnit 5.8.2'] },
  { id: 'python-3.12', label: 'Python 3.12.1', language: 'Python', image: 'python:3.12.1-slim', deps: ['pytest 8.0.0'] },
  { id: 'node-20', label: 'Node 20.11', language: 'Node.js', image: 'node:20.11.0-slim', deps: ['vitest 1.2.2'] },
  { id: 'react-18', label: 'React 18.3.1', language: 'React', image: 'node:20.11.0-slim', deps: ['react 18.3.1', '@testing-library/react 14.2.1', 'vitest 1.2.2'] },
  { id: 'react-17', label: 'React 17.0.2', language: 'React', image: 'node:16.20.2-slim', deps: ['react 17.0.2', 'enzyme 3.11.0'] },
  { id: 'docker-26', label: 'Docker 26.0', language: 'Docker', image: 'docker:26.0-dind', deps: ['compose 2.24'] },
];

export const techOptions = [
  { language: 'Java', versions: ['Java 21', 'Java 17', 'Java 11'] },
  { language: 'Python', versions: ['Python 3.12', 'Python 3.11'] },
  { language: 'React', versions: ['React 18', 'React 17'] },
  { language: 'Docker', versions: ['Docker 26', 'Docker 24'] },
  { language: 'Node.js', versions: ['Node 20', 'Node 18'] },
];

export const courses: Course[] = [
  { id: 'java-oop', title: 'Java OOP Fundamentals', description: 'Classes, encapsulation, inheritance, polymorphism and records in modern Java.', language: 'Java', runtime: 'Java 21.0.2', level: 'Beginner', durationMin: 90, slides: 12, snippets: { passed: 14, total: 14 }, status: 'verified', version: 3, updatedAt: daysAgo(0, 2), createdAt: daysAgo(12), coverage: 92, tags: ['OOP', 'Records'], accent: ['#4F46E5', '#7C3AED'] },
  { id: 'react-hooks', title: 'React Hooks Workshop', description: 'useState, useEffect, custom hooks and the rules of hooks with React 18.', language: 'React', runtime: 'React 18.3.1', level: 'Intermediate', durationMin: 120, slides: 18, snippets: { passed: 21, total: 22 }, status: 'review', statusNote: 'React version pinned', version: 2, updatedAt: daysAgo(0, 6), createdAt: daysAgo(9), coverage: 84, tags: ['Hooks', 'State'], accent: ['#0EA5E9', '#6366F1'] },
  { id: 'docker-essentials', title: 'Docker Essentials', description: 'Images, containers, volumes, networks and Compose for developers.', language: 'Docker', runtime: 'Docker 26.0', level: 'Beginner', durationMin: 90, slides: 15, snippets: { passed: 9, total: 16 }, status: 'verifying', statusNote: 'Code checks pending', version: 1, updatedAt: daysAgo(0, 0.2), createdAt: daysAgo(1), coverage: 71, tags: ['Containers', 'Compose'], accent: ['#0284C7', '#22D3EE'] },
  { id: 'python-data', title: 'Python for Data Analysis', description: 'pandas fundamentals: Series, DataFrames, grouping and cleaning data.', language: 'Python', runtime: 'Python 3.12.1', level: 'Intermediate', durationMin: 120, slides: 20, snippets: { passed: 24, total: 24 }, status: 'verified', version: 4, updatedAt: daysAgo(2), createdAt: daysAgo(30), coverage: 95, tags: ['pandas', 'Data'], accent: ['#059669', '#14B8A6'] },
  { id: 'spring-rest', title: 'REST APIs with Spring Boot 3', description: 'Controllers, validation, status codes and slice tests with MockMvc.', language: 'Java', runtime: 'Java 21.0.2', level: 'Intermediate', durationMin: 60, slides: 13, snippets: { passed: 19, total: 19 }, status: 'verified', version: 2, updatedAt: daysAgo(3), createdAt: daysAgo(20), coverage: 88, tags: ['Spring', 'REST'], accent: ['#16A34A', '#4F46E5'] },
  { id: 'node-express', title: 'Node.js & Express APIs', description: 'Routing, middleware, error handling and testing with supertest.', language: 'Node.js', runtime: 'Node 20.11', level: 'Beginner', durationMin: 60, slides: 0, snippets: { passed: 0, total: 0 }, status: 'draft', version: 1, updatedAt: daysAgo(4), createdAt: daysAgo(4), coverage: 0, tags: ['Express'], accent: ['#64748B', '#475569'] },
  { id: 'sql-joins', title: 'SQL Joins in Practice', description: 'Inner, outer and self joins with realistic schemas.', language: 'SQL', runtime: 'PostgreSQL 16.2', level: 'Beginner', durationMin: 45, slides: 10, snippets: { passed: 12, total: 12 }, status: 'verified', version: 2, updatedAt: daysAgo(6), createdAt: daysAgo(40), coverage: 90, tags: ['Joins'], accent: ['#7C3AED', '#DB2777'] },
  { id: 'ts-generics', title: 'TypeScript Generics', description: 'Generic functions, constraints, mapped and conditional types.', language: 'TypeScript', runtime: 'Node 20.11', level: 'Advanced', durationMin: 60, slides: 14, snippets: { passed: 15, total: 18 }, status: 'failed', statusNote: '3 snippets failed after 3 attempts', version: 1, updatedAt: daysAgo(7), createdAt: daysAgo(8), coverage: 76, tags: ['Types'], accent: ['#2563EB', '#1E40AF'] },
  { id: 'k8s-intro', title: 'Kubernetes for Developers', description: 'Pods, deployments, services and config for app developers.', language: 'Kubernetes', runtime: 'kind 0.22', level: 'Intermediate', durationMin: 120, slides: 6, snippets: { passed: 0, total: 0 }, status: 'generating', statusNote: 'Generating slides', version: 1, updatedAt: daysAgo(0, 0.1), createdAt: daysAgo(0, 0.1), coverage: 0, tags: ['Pods'], accent: ['#2563EB', '#7C3AED'] },
  { id: 'git-workflow', title: 'Git Branching Workflows', description: 'Feature branches, rebasing, pull requests and resolving conflicts.', language: 'Git', runtime: 'Git 2.43', level: 'Beginner', durationMin: 60, slides: 11, snippets: { passed: 9, total: 9 }, status: 'verified', version: 1, updatedAt: daysAgo(10), createdAt: daysAgo(11), coverage: 86, tags: ['Branches'], accent: ['#EA580C', '#DC2626'] },
  { id: 'java-streams', title: 'Java Streams & Lambdas', description: 'Functional style with streams, collectors and method references.', language: 'Java', runtime: 'Java 21.0.2', level: 'Intermediate', durationMin: 90, slides: 16, snippets: { passed: 17, total: 18 }, status: 'review', statusNote: '1 snippet needs review', version: 2, updatedAt: daysAgo(12), createdAt: daysAgo(25), coverage: 80, tags: ['Streams'], accent: ['#4F46E5', '#06B6D4'] },
  { id: 'pytest-testing', title: 'Testing with pytest', description: 'Fixtures, parametrisation, mocking and coverage reports.', language: 'Python', runtime: 'Python 3.12.1', level: 'Intermediate', durationMin: 60, slides: 12, snippets: { passed: 16, total: 16 }, status: 'verified', version: 3, updatedAt: daysAgo(15), createdAt: daysAgo(60), coverage: 91, tags: ['pytest'], accent: ['#0D9488', '#059669'] },
];

export const dashboardStats = [
  { key: 'courses', label: 'Courses Created', value: '12', trend: '+3 this month', up: true },
  { key: 'pass', label: 'Verification Pass Rate', value: '96%', trend: '+4.2% vs last month', up: true },
  { key: 'jobs', label: 'Jobs In Progress', value: '2', trend: 'Docker, Kubernetes', up: null },
  { key: 'exports', label: 'Exports Ready', value: '8', trend: '+2 since yesterday', up: true },
];

export const passRate30d = Array.from({ length: 30 }, (_, i) => {
  const base = 88 + i * 0.28 + Math.sin(i / 2.4) * 2.2 + (i === 11 ? -6 : 0);
  return { day: new Date(Date.now() - (29 - i) * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), rate: Math.min(99.5, +base.toFixed(1)), runs: 30 + ((i * 7) % 23) };
});

export const generationSteps = ['Outline', 'Slides', 'Code', 'Verifying', 'Export'] as const;

export const jobs = [
  { id: 'job-1', courseId: 'docker-essentials', title: 'Docker Essentials', step: 3, progress: 64, detail: 'Running snippet 10 of 16 in docker:26.0-dind', eta: '≈ 2 min' },
  { id: 'job-2', courseId: 'k8s-intro', title: 'Kubernetes for Developers', step: 1, progress: 28, detail: 'Writing slide 6 of 18', eta: '≈ 5 min' },
];

export const activity = [
  { id: 1, icon: 'check', tone: 'success', text: 'Java OOP Fundamentals passed verification (14/14 snippets)', at: daysAgo(0, 2) },
  { id: 2, icon: 'wrench', tone: 'warning', text: 'Auto-fixed BankAccount.withdraw() on attempt 2', at: daysAgo(0, 2.2) },
  { id: 3, icon: 'upload', tone: 'info', text: 'Exported React Hooks Workshop as PPTX + PDF', at: daysAgo(0, 6) },
  { id: 4, icon: 'arrow', tone: 'default', text: 'Upgraded Java Streams from Java 11 to Java 21', at: daysAgo(1, 3) },
  { id: 5, icon: 'comment', tone: 'default', text: 'Priya Sharma reviewed slide 7 of Spring REST APIs', at: daysAgo(1, 8) },
  { id: 6, icon: 'x', tone: 'danger', text: 'TypeScript Generics: 3 snippets failed after 3 attempts', at: daysAgo(7) },
];

export const notifications = [
  { id: 'n1', title: 'Verification passed', body: 'Java OOP Fundamentals · 14/14 snippets', at: daysAgo(0, 2), unread: true, tone: 'success', href: '/reports' },
  { id: 'n2', title: 'Auto-fix applied', body: 'BankAccount.withdraw() fixed on attempt 2 of 3', at: daysAgo(0, 2.2), unread: true, tone: 'warning', href: '/verification' },
  { id: 'n3', title: 'Export ready', body: 'React Hooks Workshop · PPTX, PDF', at: daysAgo(0, 6), unread: true, tone: 'info', href: '/exports' },
  { id: 'n4', title: 'Review requested', body: 'Priya left 2 comments on Spring REST APIs', at: daysAgo(1, 8), unread: false, tone: 'default', href: '/team' },
];

/* ---------------- Studio content (Java OOP Fundamentals) ---------------- */

export type SlideLayout = 'title' | 'bullets' | 'code' | 'diagram' | 'two-col' | 'grid' | 'timeline' | 'callout' | 'summary';
export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  layout: SlideLayout;
  bullets: string[];
  takeaway?: string;
  badge?: string;
  code?: string;
  lang?: string;
  diagramId?: string;
  diagram?: { nodes: { id: string; label: string; x: number; y: number }[]; edges: [string, string][] };
  exampleId?: string;
  notes: string;
  status: 'passed' | 'failed' | 'pending' | 'none';
}

export const javaSlides: Slide[] = [
  {
    id: 's1',
    title: 'Java OOP Fundamentals & Modern Architecture',
    subtitle: 'From Primitive Classes to Virtual Threads & Record Patterns in Java 21 LTS',
    layout: 'title',
    badge: 'Java 21 LTS',
    bullets: ['Comprehensive Course · 90 minutes · Production-Grade Best Practices'],
    notes: 'Welcome everyone. Today we move beyond toy syntax into building production-grade domain models in modern Java. We will model a high-throughput banking system step-by-step.',
    status: 'none'
  },
  {
    id: 's2',
    title: 'The Four Pillars of Object-Oriented Design',
    subtitle: 'Structuring Complex Systems for High Maintainability and Long-Term Scalability',
    layout: 'grid',
    badge: 'Core Architecture',
    bullets: [
      'Encapsulation: Shielding internal state behind strict invariant-guarding methods',
      'Abstraction: Exposing clear contracts while decoupling consumers from volatile implementation details',
      'Inheritance: Modeling structural is-a relationships with controlled polymorphism and sealed hierarchies',
      'Polymorphism: Dynamically dispatching runtime behavior to cleanly eliminate brittle if-else ladders'
    ],
    takeaway: 'Pro Tip: Favor composition over inheritance unless an unconditional is-a relationship exists.',
    notes: 'Contrast a procedural monolithic script that mutates global balance variables with an isolated domain model. Show how encapsulation prevents concurrent corruption.',
    status: 'none'
  },
  {
    id: 's3',
    title: 'Classes, Objects & Heap Memory Allocation',
    subtitle: 'Blueprint Declaration vs Heap Instantiation & Reference Pointer Semantics',
    layout: 'code',
    badge: 'Memory Model',
    bullets: [
      'A class acts as an immutable blueprint compiled into JVM bytecode',
      'The "new" operator allocates distinct object memory on the Java Heap',
      'Variables store memory references (pointers); mutations affect only the targeted instance'
    ],
    takeaway: 'Memory Note: Each object instance carries an object header (Mark Word + Klass Word) of 12-16 bytes.',
    code: 'public class Main {\n    public static void main(String[] args) {\n        // Independent heap allocations\n        Account a = new Account("Asha", 500.0);\n        Account b = new Account("Ravi", 120.0);\n        \n        System.out.println(a.owner() + ": " + a.balance());\n        System.out.println(b.owner() + ": " + b.balance());\n    }\n}',
    lang: 'java',
    notes: 'Run this live. Emphasize that reference variables a and b point to distinct heap addresses. Illustrate stack frame pointers pointing to heap instances.',
    status: 'passed'
  },
  {
    id: 's4',
    title: 'Data Encapsulation & Guarding Invariants',
    subtitle: 'Protecting Domain Integrity by Eliminating Illegal State Transitions',
    layout: 'code',
    badge: 'Domain Security',
    bullets: [
      'Private fields guarantee that outside callers cannot arbitrarily overwrite state',
      'Public mutators validate preconditions (e.g. amount > 0, overdraft boundaries)',
      'Invalid states become physically impossible to construct or persist'
    ],
    takeaway: 'Defensive Rule: Never expose mutable collection references—always return unmodifiable views.',
    code: 'public class BankAccount {\n    private double balance; // Protected internal state\n\n    public void deposit(double amount) {\n        if (amount <= 0) {\n            throw new IllegalArgumentException("Deposit amount must be strictly positive");\n        }\n        this.balance += amount;\n    }\n\n    public double getBalance() { return balance; }\n}',
    lang: 'java',
    notes: 'Challenge the class: What happens if balance were public? An inexperienced developer could assign balance = -50000. Encapsulation is your first line of defense.',
    status: 'passed'
  },
  {
    id: 's5',
    title: 'Constructors, Overloading & Constructor Chaining',
    subtitle: 'Guaranteed Object Initialization & Safe Parameter Validation',
    layout: 'code',
    badge: 'Initialization',
    bullets: [
      'Constructors run once at instantiation to ensure an object begins in a valid state',
      'Overloaded constructors provide ergonomic call sites for common default parameters',
      'Constructor chaining with this(...) eliminates duplicate validation logic'
    ],
    takeaway: 'Best Practice: Keep initialization logic in one canonical constructor; delegate all others to it.',
    code: 'public class BankAccount {\n    private final String owner;\n    private double balance;\n\n    // Canonical Constructor\n    public BankAccount(String owner, double opening) {\n        if (opening < 0) throw new IllegalArgumentException("Opening balance cannot be negative");\n        this.owner = Objects.requireNonNull(owner, "Owner required");\n        this.balance = opening;\n    }\n\n    // Overloaded convenience constructor\n    public BankAccount(String owner) {\n        this(owner, 0.0);\n    }\n}',
    lang: 'java',
    notes: 'Highlight how this(...) prevents copying and pasting validation rules. Mention that once you declare any constructor, the compiler default no-arg constructor is removed.',
    status: 'passed'
  },
  {
    id: 's6',
    title: 'Domain Lifecycle & State Transitions',
    subtitle: 'The Standard Execution Pipeline of a Production Banking Domain Object',
    layout: 'timeline',
    badge: 'Lifecycle',
    bullets: [
      '1. Allocation & Validation: Constructor parses inputs and verifies invariants',
      '2. Transaction Execution: Business logic validates funds and computes state transitions',
      '3. Audit Logging: Notifications and ledger events dispatched asynchronously',
      '4. Garbage Collection: Mark-and-sweep reclaims unreferenced heap allocations'
    ],
    takeaway: 'Key Takeaway: Design objects with clean lifecycles to prevent resource leaks and dangling state.',
    notes: 'Walk students through the 4 stages. Ask what happens if an exception is thrown in stage 2: does stage 3 execute? Show how transactional boundaries work.',
    status: 'none'
  },
  {
    id: 's7',
    title: 'Defensive Programming: Withdrawing Safely',
    subtitle: 'Verifying Invariants with Comprehensive JUnit 5 Test Coverage',
    layout: 'code',
    badge: 'Quality & Testing',
    bullets: [
      'Check preconditions before state mutation to ensure idempotency',
      'Distinguish business rule rejections from fatal programming errors',
      'Fully verified with automated unit tests covering all boundary conditions'
    ],
    takeaway: 'Testing Rule: Always write automated test cases for exact balance boundary conditions (amount == balance).',
    code: 'public String withdraw(double amount) {\n    if (amount <= 0) {\n        throw new IllegalArgumentException("Withdrawal must be positive");\n    }\n    if (amount > balance) {\n        return "Insufficient funds";\n    }\n    this.balance -= amount;\n    return "OK";\n}',
    lang: 'java',
    notes: 'Show how this snippet was tested and auto-verified. Highlight the boundary condition where withdrawal equals exact balance.',
    status: 'passed'
  },
  {
    id: 's8',
    title: 'Dynamic Polymorphism in Action',
    subtitle: 'Decoupling Consumers from Concrete Subclasses at Runtime',
    layout: 'code',
    badge: 'Polymorphism',
    bullets: [
      'One unified interface call, diverse runtime execution behaviors',
      'Eliminates fragile switch statements and manual instanceof checks',
      'Annotate overrides with @Override to enforce compiler verification'
    ],
    takeaway: 'Clean Code: Open-Closed Principle (OCP)—Open for extension, closed for modification.',
    code: 'List<BankAccount> accounts = List.of(\n    new SavingsAccount("Asha", 1000.0, 0.04),\n    new CurrentAccount("Ravi", 300.0, 500.0)\n);\n\n// Single polymorphic loop\nfor (BankAccount acc : accounts) {\n    System.out.println(acc.owner() + " Fee: " + acc.monthlyFee());\n}',
    lang: 'java',
    notes: 'Demonstrate dynamic dispatch: the JVM looks up the vtable (virtual method table) of the concrete instance to invoke the right method at runtime.',
    status: 'passed'
  },
  {
    id: 's9',
    title: 'Interface Segregation & Decoupled Contracts',
    subtitle: 'Building Flexible Systems with Plug-and-Play Implementations',
    layout: 'code',
    badge: 'Design Patterns',
    bullets: [
      'Interfaces define what an object can do, not how it does it',
      'Classes can implement multiple interfaces without diamond inheritance conflicts',
      'Enables painless test mocking with Mockito in integration tests'
    ],
    takeaway: 'Architecture Rule: Program to an interface, not to a concrete implementation.',
    code: 'public interface Notifier {\n    void send(String recipient, String message);\n}\n\npublic class SmsNotifier implements Notifier {\n    public void send(String to, String msg) {\n        System.out.println("SMS -> " + to + ": " + msg);\n    }\n}\n\n// In unit tests, easily substitute a MockNotifier without touching BankAccount!',
    lang: 'java',
    notes: 'Show how BankAccount can depend on Notifier rather than concrete SmsNotifier. Demonstrate swapping SMS for Email or Kafka event publisher.',
    status: 'passed'
  },
  {
    id: 's10',
    title: 'Modern Java 21 Records & Pattern Matching',
    subtitle: 'Transparent Carriers for Immutable Data with Pattern Matching Support',
    layout: 'code',
    badge: 'Java 21 Feature',
    bullets: [
      'Immutable data carriers with zero boilerplate (equals, hashCode, toString)',
      'Deconstruction in pattern matching switch statements for deep type safety',
      'Compact constructors allow concise data normalization and invariant validation'
    ],
    takeaway: 'Syntax Pro-Tip: Use records for DTOs, value objects, API payloads, and query projection results.',
    code: 'public record Transaction(String id, double amount, Instant timestamp) {\n    // Compact constructor for validation\n    public Transaction {\n        if (amount == 0) throw new IllegalArgumentException("Amount cannot be 0");\n    }\n}\n\nvar tx = new Transaction("TX-9901", 450.0, Instant.now());\nSystem.out.println(tx); // Transaction[id=TX-9901, amount=450.0, timestamp=...]',
    lang: 'java',
    notes: 'Compare the 2 lines of record definition against the 50 lines of traditional Java bean code. Show how records fit into modern cloud microservices.',
    status: 'passed'
  },
  {
    id: 's11',
    title: 'Architectural Comparison: Abstract Class vs Interface',
    subtitle: 'Clear Decision Criteria for Enterprise Domain Hierarchy Design',
    layout: 'two-col',
    badge: 'Architecture',
    bullets: [
      'Abstract Class (Is-A)',
      'Can encapsulate internal state (private instance fields)',
      'Provides common code sharing across tightly coupled siblings',
      'Restricted to single inheritance per class',
      'Interface (Can-Do)',
      'Pure behavioral contract without instance state',
      'Any class can implement multiple independent interfaces',
      'Can provide default utility methods without breaking implementors'
    ],
    takeaway: 'Decision Matrix: Use an interface to define capabilities; use an abstract class only when sharing non-static state.',
    notes: 'A common interview trap: When do you pick an abstract class over an interface? Walk through this decision tree.',
    status: 'none'
  },
  {
    id: 's12',
    title: 'Core Architecture Takeaway & Golden Rules',
    subtitle: 'The Essential Principles of Scalable, Production-Ready Java Applications',
    layout: 'callout',
    badge: 'Golden Rule',
    bullets: [
      '"Design your classes so that illegal states are unrepresentable, data is immutable by default, and components communicate through narrow interfaces."',
      '1. Encapsulate all mutable state behind strict invariants',
      '2. Favor composition and interfaces over deep inheritance trees',
      '3. Use Records for immutable data transfer and modern pattern matching',
      '4. Protect system boundaries with comprehensive automated test suites'
    ],
    takeaway: 'Mastering these fundamentals ensures clean, maintainable, and bug-resistant enterprise systems.',
    notes: 'Conclude the lecture. Invite questions from the room. Hand out the cheat sheet and review the exercise solutions.',
    status: 'none'
  }
];

export const diagrams = [
  { id: 'd1', title: 'Account hierarchy', kind: 'Class diagram', nodes: [{ id: 'a', label: 'BankAccount', x: 50, y: 12 }, { id: 'b', label: 'SavingsAccount', x: 22, y: 62 }, { id: 'c', label: 'CurrentAccount', x: 78, y: 62 }], edges: [['b', 'a'], ['c', 'a']], updatedAt: daysAgo(0, 2) },
  { id: 'd2', title: 'Deposit flow', kind: 'Flowchart', nodes: [{ id: 'a', label: 'deposit(amount)', x: 15, y: 50 }, { id: 'b', label: 'amount > 0 ?', x: 50, y: 50 }, { id: 'c', label: 'balance += amount', x: 85, y: 25 }, { id: 'd', label: 'throw error', x: 85, y: 75 }], edges: [['a', 'b'], ['b', 'c'], ['b', 'd']], updatedAt: daysAgo(0, 2) },
  { id: 'd3', title: 'Object lifecycle', kind: 'Sequence', nodes: [{ id: 'a', label: 'new Account()', x: 12, y: 50 }, { id: 'b', label: 'constructor', x: 38, y: 50 }, { id: 'c', label: 'in use', x: 64, y: 50 }, { id: 'd', label: 'garbage collected', x: 88, y: 50 }], edges: [['a', 'b'], ['b', 'c'], ['c', 'd']], updatedAt: daysAgo(1) },
  { id: 'd4', title: 'Notifier dependency', kind: 'Component', nodes: [{ id: 'a', label: 'BankAccount', x: 20, y: 50 }, { id: 'b', label: '«interface» Notifier', x: 55, y: 50 }, { id: 'c', label: 'SmsNotifier', x: 88, y: 25 }, { id: 'd', label: 'EmailNotifier', x: 88, y: 75 }], edges: [['a', 'b'], ['c', 'b'], ['d', 'b']], updatedAt: daysAgo(1) },
];

export const codeExamples = [
  { id: 'e1', title: 'Two independent accounts', description: 'Objects keep their own state.', code: 'public class Main {\n    record Account(String owner, double balance) {}\n\n    public static void main(String[] args) {\n        var a = new Account("Asha", 500);\n        var b = new Account("Ravi", 120);\n        System.out.println(a.owner() + " has " + a.balance());\n        System.out.println(b.owner() + " has " + b.balance());\n    }\n}', output: 'Asha has 500.0\nRavi has 120.0', ms: 412 },
  { id: 'e2', title: 'Encapsulated deposit', description: 'The method guards the rule; the field stays private.', code: 'public class Main {\n    static class BankAccount {\n        private double balance;\n        void deposit(double amount) {\n            if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");\n            balance += amount;\n        }\n        double balance() { return balance; }\n    }\n\n    public static void main(String[] args) {\n        var acc = new BankAccount();\n        acc.deposit(250);\n        System.out.println("Balance: " + acc.balance());\n        try { acc.deposit(-5); }\n        catch (IllegalArgumentException e) { System.out.println("Rejected: " + e.getMessage()); }\n    }\n}', output: 'Balance: 250.0\nRejected: Amount must be positive', ms: 438 },
  { id: 'e3', title: 'Polymorphic fees', description: 'One loop, behaviour chosen at runtime.', code: 'import java.util.List;\n\npublic class Main {\n    interface Account { double monthlyFee(); }\n    record Savings() implements Account { public double monthlyFee() { return 0; } }\n    record Current() implements Account { public double monthlyFee() { return 4.5; } }\n\n    public static void main(String[] args) {\n        for (Account a : List.of(new Savings(), new Current()))\n            System.out.println(a.getClass().getSimpleName() + ": " + a.monthlyFee());\n    }\n}', output: 'Savings: 0.0\nCurrent: 4.5', ms: 401 },
];

export const exercises = [
  {
    id: 'x1', title: 'Safe withdrawal', difficulty: 'Easy',
    statement: 'Implement withdraw(double amount) on BankAccount. Return "Insufficient funds" when the amount exceeds the balance (leaving the balance unchanged), reject non-positive amounts with an IllegalArgumentException, otherwise subtract and return "OK".',
    starter: 'public class BankAccount {\n    private double balance;\n\n    public BankAccount(double opening) { this.balance = opening; }\n\n    public String withdraw(double amount) {\n        // TODO\n        return null;\n    }\n\n    public double getBalance() { return balance; }\n}',
    tests: [
      { name: 'withdraws when funds are available', pass: true, ms: 4 },
      { name: 'returns "Insufficient funds" when overdrawn', pass: true, ms: 2 },
      { name: 'leaves balance unchanged when overdrawn', pass: true, ms: 1 },
      { name: 'rejects zero amount', pass: true, ms: 1 },
      { name: 'rejects negative amount', pass: true, ms: 1 },
      { name: 'allows withdrawing the exact balance', pass: false, ms: 2, error: 'expected: <"OK"> but was: <"Insufficient funds">' },
    ],
    reference: 'Passes 6/6', naive: 'Fails 3/6 (no guard for non-positive amounts)',
  },
  {
    id: 'x2', title: 'Savings interest', difficulty: 'Medium',
    statement: 'Create SavingsAccount extends BankAccount with addMonthlyInterest(double ratePercent) that adds interest rounded to 2 decimals.',
    starter: 'public class SavingsAccount extends BankAccount {\n    public SavingsAccount(double opening) { super(opening); }\n\n    public void addMonthlyInterest(double ratePercent) {\n        // TODO\n    }\n}',
    tests: [
      { name: 'adds 1% to 1000', pass: true, ms: 3 }, { name: 'rounds to two decimals', pass: true, ms: 2 },
      { name: 'zero rate leaves balance', pass: true, ms: 1 }, { name: 'rejects negative rate', pass: true, ms: 1 },
    ],
    reference: 'Passes 4/4', naive: 'Fails 2/4 (no rounding)',
  },
  {
    id: 'x3', title: 'Transaction history', difficulty: 'Hard',
    statement: 'Record every deposit and withdrawal as a Transaction record and expose an unmodifiable history list in insertion order.',
    starter: 'import java.util.*;\n\npublic class BankAccount {\n    public record Transaction(String type, double amount) {}\n    // TODO: keep a history\n    public List<Transaction> history() { return List.of(); }\n}',
    tests: [
      { name: 'records deposits', pass: true, ms: 2 }, { name: 'records withdrawals', pass: true, ms: 2 },
      { name: 'keeps insertion order', pass: true, ms: 1 }, { name: 'history is unmodifiable', pass: true, ms: 1 },
      { name: 'failed withdrawals are not recorded', pass: true, ms: 1 },
    ],
    reference: 'Passes 5/5', naive: 'Fails 2/5 (returns the internal list)',
  },
];

export interface QuizQuestion {
  q: string;
  code?: string;
  options: string[];
  answer: number;
  explanation: string;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const quiz: QuizQuestion[] = [
  {
    q: 'Which keyword allocates memory and creates a new instance of an object in Java?',
    options: ['class', 'new', 'this', 'static'],
    answer: 1,
    explanation: 'The "new" operator dynamically allocates memory on the heap for an object and invokes its constructor. The "class" keyword only defines the blueprint.',
    category: 'Core OOP',
    difficulty: 'Beginner'
  },
  {
    q: 'Why should the internal state (such as account balance) be marked private with public mutating methods?',
    options: ['Private fields are automatically cached in CPU L1 cache', 'It enforces encapsulation so state transitions can be strictly validated and invariants protected', 'Java requires private fields for serialization', 'It prevents garbage collection'],
    answer: 1,
    explanation: 'Encapsulation guarantees data integrity. By keeping fields private, callers cannot directly set illegal states (e.g. balance = -9999). Every change must pass through validated business methods.',
    category: 'Encapsulation',
    difficulty: 'Beginner'
  },
  {
    q: 'What boilerplate code does a Java Record automatically eliminate?',
    options: ['Setters and mutable field modifiers', 'Canonical constructor, private final fields, accessor methods, equals(), hashCode(), and toString()', 'Database connection pools and ORM queries', 'HTTP controller endpoints'],
    answer: 1,
    explanation: 'Records (introduced in Java 16) are transparent carriers for immutable data. They synthesize private final fields, a canonical constructor, accessors matching field names, equals(), hashCode(), and toString().',
    category: 'Modern Java',
    difficulty: 'Beginner'
  },
  {
    q: 'What is the maximum number of interfaces a single Java class can implement?',
    options: ['Exactly one', 'At most two', 'Unlimited (any number of interfaces)', 'None if the class extends another class'],
    answer: 2,
    explanation: 'Java supports single inheritance for classes (extends at most one superclass) but multiple inheritance of type via interfaces (implements any number of interfaces).',
    category: 'Interfaces',
    difficulty: 'Beginner'
  },
  {
    q: 'When acc.monthlyFee() calls the subclass implementation decided at runtime, which OOP principle is active?',
    options: ['Method Overloading (static dispatch)', 'Dynamic Polymorphism (virtual method invocation)', 'Data Encapsulation', 'Prototypal Inheritance'],
    answer: 1,
    explanation: 'Polymorphism allows objects of different subclasses to respond to the same method invocation in their own specific way via dynamic dispatch at runtime.',
    category: 'Polymorphism',
    difficulty: 'Intermediate'
  },
  {
    q: 'What occurs when this(owner, 0) is invoked on the first line of an overloaded constructor?',
    options: ['It instantiates a second independent object', 'It delegates initialization to another constructor within the same class (constructor chaining)', 'It invokes the superclass constructor', 'It triggers garbage collection on the current object'],
    answer: 1,
    explanation: 'this(...) delegates initialization to another constructor in the same class. In contrast, super(...) delegates to the parent class constructor.',
    category: 'Constructors',
    difficulty: 'Beginner'
  },
  {
    q: 'Consider this snippet. What will be printed when executed?',
    code: 'record Point(int x, int y) {}\nPoint p1 = new Point(10, 20);\nPoint p2 = new Point(10, 20);\nSystem.out.println((p1 == p2) + " " + p1.equals(p2));',
    options: ['true true', 'false true', 'false false', 'true false'],
    answer: 1,
    explanation: 'p1 == p2 checks reference equality (pointing to different heap addresses = false). p1.equals(p2) checks structural field equality, which records automatically implement based on component values = true.',
    category: 'Modern Java',
    difficulty: 'Intermediate'
  },
  {
    q: 'What is the primary architectural advantage of Java 21 Virtual Threads over OS Platform Threads?',
    options: ['Virtual threads execute bytecode faster on the CPU', 'Virtual threads are lightweight user-mode threads (~few KB) that unmount during blocking I/O, enabling millions of concurrent tasks', 'Virtual threads eliminate the need for thread safety', 'Virtual threads share the same call stack'],
    answer: 1,
    explanation: 'Virtual threads (Project Loom in Java 21) are managed by the JVM runtime rather than 1:1 OS kernel threads. When a virtual thread blocks on socket/file I/O, it unmounts from its carrier thread, allowing the carrier thread to serve other requests.',
    category: 'Concurrency',
    difficulty: 'Advanced'
  },
  {
    q: 'What problem does the try-with-resources statement solve in Java?',
    options: ['It catches unhandled OutOfMemoryErrors', 'It automatically closes AutoCloseable resources even if an exception occurs, preventing resource leaks', 'It runs code concurrently in a separate thread', 'It optimizes JIT compiler loop unrolling'],
    answer: 1,
    explanation: 'try-with-resources guarantees that every resource declared in the try(...) clause implementing java.lang.AutoCloseable is closed automatically when leaving the block, even if exceptions are thrown.',
    category: 'Clean Code',
    difficulty: 'Intermediate'
  },
  {
    q: 'In the following snippet, what does the compiler report?',
    code: 'List<String> names = new ArrayList<>();\nnames.add("Alice");\nList<?> wildcard = names;\nwildcard.add("Bob");',
    options: ['Compiles and adds "Bob" to the list', 'Compilation Error: The method add(capture# of ?) is not applicable for String', 'Runtime ClassCastException thrown', 'List becomes immutable'],
    answer: 1,
    explanation: 'List<?> represents a list of an unknown type. Because the compiler cannot verify the specific type safety at compile time, you cannot add any elements (except null) to a wildcard collection.',
    category: 'Generics',
    difficulty: 'Advanced'
  },
  {
    q: 'What is the difference between a Shallow Copy and a Deep Copy of an object?',
    options: ['Shallow copy only copies primitives and duplicates object references; Deep copy recursively creates new copies of referenced objects', 'Shallow copies are stored on the stack; Deep copies on the heap', 'Shallow copy uses clone(); Deep copy uses serialization only', 'There is no difference in modern Java'],
    answer: 0,
    explanation: 'A shallow copy duplicates the immediate field values (including references to nested objects). If a nested object is mutated, both copies reflect the change. A deep copy recursively clones all child objects.',
    category: 'Memory & Architecture',
    difficulty: 'Intermediate'
  },
  {
    q: 'Which Java Stream operation is stateful and requires inspecting all elements before producing output?',
    options: ['map()', 'filter()', 'sorted()', 'peek()'],
    answer: 2,
    explanation: 'sorted() is a stateful intermediate operation that must consume and buffer the entire stream before it can yield the first sorted element. In contrast, map and filter are stateless and process elements lazily one by one.',
    category: 'Streams & Functional',
    difficulty: 'Intermediate'
  },
  {
    q: 'Why is String immutable in Java?',
    options: ['For thread-safety, security in classloading/networking, and enabling String Constant Pool memory caching', 'To prevent String from being garbage collected', 'Because Java does not support array resizing', 'Because primitive chars are immutable'],
    answer: 0,
    explanation: 'Immutability enables the String Constant Pool (deduplicating identical strings in memory), ensures thread safety across concurrent operations without locking, and prevents malicious modification of critical parameters like file paths and URLs.',
    category: 'Memory & Architecture',
    difficulty: 'Intermediate'
  },
  {
    q: 'What is the purpose of the volatile keyword in Java multithreading?',
    options: ['It guarantees atomic increment operations (count++)', 'It guarantees visibility of variable updates across CPU thread caches without using mutex locks', 'It serializes the variable to disk', 'It prevents the variable from being initialized to null'],
    answer: 1,
    explanation: 'volatile ensures that reads and writes to a variable bypass thread-local CPU L1/L2 caches and interact directly with main memory, providing happens-before visibility guarantees without locking overhead.',
    category: 'Concurrency',
    difficulty: 'Advanced'
  },
  {
    q: 'In Spring Boot, what is the default scope of a declared @Component or @Service bean?',
    options: ['Prototype (new instance created per injection point)', 'Singleton (single shared instance cached in the ApplicationContext)', 'Request (one instance per HTTP request)', 'Session (one instance per user session)'],
    answer: 1,
    explanation: 'Spring beans default to Singleton scope, meaning the Spring IoC container creates and manages a single shared instance per ApplicationContext.',
    category: 'Spring Framework',
    difficulty: 'Intermediate'
  },
  {
    q: 'What occurs when an unhandled Checked Exception is thrown from a Java method?',
    options: ['The JVM ignores it and continues execution', 'The code fails to compile unless declared in a throws clause or handled in a try-catch block', 'It is converted into a NullPointerException', 'The compiler automatically retries the method'],
    answer: 1,
    explanation: 'Checked exceptions (subclasses of Exception excluding RuntimeException) are checked at compile time. The compiler mandates that methods either catch them or explicitly declare them using the "throws" keyword.',
    category: 'Exception Handling',
    difficulty: 'Beginner'
  },
  {
    q: 'What is the time complexity of looking up a key in a well-distributed Java HashMap?',
    options: ['O(N)', 'O(log N)', 'O(1) amortized', 'O(N^2)'],
    answer: 2,
    explanation: 'HashMap calculates the bucket index via key.hashCode() in O(1) time. With low collision probability, lookup is O(1) amortized. In case of high collisions, Java 8+ converts buckets with >8 nodes into balanced red-black trees with O(log N) worst-case lookup.',
    category: 'Collections & Data Structures',
    difficulty: 'Intermediate'
  },
  {
    q: 'Which design pattern is implemented when an object publishes notifications to registered listeners without knowing their concrete classes?',
    options: ['Singleton Pattern', 'Observer Pattern', 'Factory Method Pattern', 'Adapter Pattern'],
    answer: 1,
    explanation: 'The Observer pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically in a decoupled manner.',
    category: 'Design Patterns',
    difficulty: 'Intermediate'
  }
];

export const cheatSheet = [
  { title: 'Classes & objects', items: [['class Account { }', 'Declare a class'], ['new Account()', 'Create an object'], ['this.owner', 'Refer to this object']] },
  { title: 'Encapsulation', items: [['private double balance;', 'Hide state'], ['public double getBalance()', 'Read through a method'], ['throw new IllegalArgumentException()', 'Reject invalid input']] },
  { title: 'Constructors', items: [['Account(String o) { … }', 'Run on creation'], ['this(o, 0)', 'Chain constructors'], ['super(o)', 'Call parent constructor']] },
  { title: 'Inheritance', items: [['class S extends Account', 'Reuse & specialise'], ['@Override', 'Replace parent behaviour'], ['final class', 'Prevent subclassing']] },
  { title: 'Interfaces', items: [['interface Notifier { }', 'Declare a contract'], ['implements Notifier', 'Fulfil it'], ['default void log()', 'Shared method body']] },
  { title: 'Records (Java 16+)', items: [['record Tx(String id, double a)', 'Immutable data'], ['tx.id()', 'Accessor'], ['case Tx(var id, var a) ->', 'Pattern matching (21)']] },
];

/* ---------------- Verification center ---------------- */

export interface Snippet {
  id: string;
  name: string;
  location: string;
  code: string;
  fixedCode?: string;
  expected: string;
  actual: string;
  actualFirst?: string;
  finalStatus: 'passed' | 'failed';
  failsFirst?: boolean;
  ms: number;
  tests: { passed: number; total: number };
  logs: string[];
}

export const snippets: Snippet[] = [
  { id: 'sn1', name: 'Main.main – two accounts', location: 'Slide 3', code: javaSlides[2].code!, expected: 'Asha: 500.0\nRavi: 120.0', actual: 'Asha: 500.0\nRavi: 120.0', finalStatus: 'passed', ms: 412, tests: { passed: 1, total: 1 }, logs: ['$ javac --release 21 Main.java Account.java', '$ java Main', 'Asha: 500.0', 'Ravi: 120.0', 'exit 0'] },
  { id: 'sn2', name: 'BankAccount.deposit', location: 'Slide 4', code: javaSlides[3].code!, expected: 'Balance: 250.0\nRejected: Amount must be positive', actual: 'Balance: 250.0\nRejected: Amount must be positive', finalStatus: 'passed', ms: 438, tests: { passed: 3, total: 3 }, logs: ['$ javac --release 21 BankAccount.java DepositCheck.java', '$ java DepositCheck', 'exit 0'] },
  { id: 'sn3', name: 'BankAccount constructors', location: 'Slide 5', code: javaSlides[4].code!, expected: '(compiles)', actual: '(compiles)', finalStatus: 'passed', ms: 377, tests: { passed: 2, total: 2 }, logs: ['$ javac --release 21 BankAccount.java', 'exit 0'] },
  {
    id: 'sn4', name: 'BankAccount.withdraw', location: 'Slide 7 · Exercise 1',
    code: 'public String withdraw(double amount) {\n    if (amount > balance) {\n        throw new IllegalStateException("Insufficient funds");\n    }\n    balance -= amount;\n    return "OK";\n}',
    fixedCode: javaSlides[6].code!,
    expected: 'OK\nInsufficient funds\nbalance=50.0', actualFirst: 'OK\nException in thread "main" java.lang.IllegalStateException: Insufficient funds\n\tat BankAccount.withdraw(BankAccount.java:9)', actual: 'OK\nInsufficient funds\nbalance=50.0',
    finalStatus: 'passed', failsFirst: true, ms: 456, tests: { passed: 6, total: 6 },
    logs: ['$ javac --release 21 BankAccount.java WithdrawCheck.java', '$ java WithdrawCheck', 'OK', 'Exception in thread "main" java.lang.IllegalStateException: Insufficient funds', '    at BankAccount.withdraw(BankAccount.java:9)', '    at WithdrawCheck.main(WithdrawCheck.java:6)', 'exit 1'],
  },
  { id: 'sn5', name: 'Polymorphic monthlyFee', location: 'Slide 8', code: javaSlides[7].code!, expected: '0.0\n4.5', actual: '0.0\n4.5', finalStatus: 'passed', ms: 421, tests: { passed: 2, total: 2 }, logs: ['$ javac --release 21 *.java', '$ java FeeCheck', 'exit 0'] },
  { id: 'sn6', name: 'Notifier interface', location: 'Slide 9', code: javaSlides[8].code!, expected: 'SMS: Payment received', actual: 'SMS: Payment received', finalStatus: 'passed', ms: 389, tests: { passed: 1, total: 1 }, logs: ['$ javac --release 21 Notifier.java SmsNotifier.java', 'exit 0'] },
  { id: 'sn7', name: 'Transaction record', location: 'Slide 10', code: javaSlides[9].code!, expected: 'Transaction[id=T-1001, amount=250.0]', actual: 'Transaction[id=T-1001, amount=250.0]', finalStatus: 'passed', ms: 402, tests: { passed: 1, total: 1 }, logs: ['$ java --source 21 Snippet.java', 'exit 0'] },
  { id: 'sn8', name: 'Exercise 2 · SavingsAccount', location: 'Exercise 2', code: exercises[1].starter, expected: '4/4 tests pass (reference)\n≥1 test fails (naive)', actual: '4/4 tests pass (reference)\n2/4 tests fail (naive)', finalStatus: 'passed', ms: 1310, tests: { passed: 4, total: 4 }, logs: ['$ java -jar junit-platform-console-standalone-1.10.2.jar --select-class SavingsAccountTest', '[ 4 tests successful ]', '[ 0 tests failed ]'] },
];

export const retryTimeline = [
  { attempt: 1, status: 'failed', title: 'Runtime error', detail: 'IllegalStateException thrown, but the slide promises a returned message "Insufficient funds".', at: '14:02:11' },
  { attempt: 2, status: 'passed', title: 'Auto-fix applied', detail: 'Replaced the throw with return "Insufficient funds"; balance left unchanged. Output now matches.', at: '14:02:19' },
];

/* ---------------- Reports ---------------- */

export const reports = courses.filter(c => c.snippets.total > 0).map((c, i) => ({
  id: `rep-${100 + i}`,
  courseId: c.id,
  course: c.title,
  date: c.updatedAt,
  passed: c.snippets.passed,
  failed: c.snippets.total - c.snippets.passed,
  total: c.snippets.total,
  runtime: c.runtime,
  status: c.snippets.passed === c.snippets.total ? 'passed' : c.status === 'failed' ? 'failed' : 'review',
  durationS: +(c.snippets.total * 0.48 + 3.1).toFixed(1),
}));

export const reportDetail = {
  dependencies: [
    { name: 'JDK', version: 'Temurin 21.0.2+13', scope: 'runtime' },
    { name: 'JUnit Jupiter', version: '5.10.2', scope: 'test' },
    { name: 'JUnit Platform Console', version: '1.10.2', scope: 'test' },
    { name: 'AssertJ', version: '3.25.3', scope: 'test' },
    { name: 'Sandbox image', version: 'eclipse-temurin:21.0.2_13-jdk', scope: 'container' },
  ],
  snippets: snippets.map(s => ({
    id: s.id, name: s.name, location: s.location, status: 'passed' as const, ms: s.ms, attempts: s.failsFirst ? 2 : 1,
    reference: { passed: s.tests.total, total: s.tests.total }, naive: { passed: Math.max(0, s.tests.total - Math.max(1, Math.ceil(s.tests.total / 2))), total: s.tests.total },
    log: s.logs.join('\n'),
  })),
};

/* ---------------- Exports ---------------- */

export const exportFormats = [
  { id: 'pptx', label: 'PowerPoint deck', ext: 'PPTX', size: '4.2 MB', desc: '12 slides · speaker notes embedded' },
  { id: 'pdf', label: 'Slides PDF', ext: 'PDF', size: '2.8 MB', desc: '16:9 · fonts embedded' },
  { id: 'notes', label: 'Trainer notes', ext: 'PDF', size: '640 KB', desc: 'Per-slide notes, timings, answers' },
  { id: 'code', label: 'Code bundle', ext: 'ZIP', size: '86 KB', desc: 'Maven project · all examples' },
  { id: 'exercises', label: 'Exercises & tests', ext: 'ZIP', size: '54 KB', desc: 'Starter code, JUnit 5 tests' },
  { id: 'quiz', label: 'Quiz', ext: 'PDF', size: '210 KB', desc: '6 questions with explanations' },
  { id: 'cheat', label: 'Cheat sheet', ext: 'PDF', size: '180 KB', desc: 'One A4 page' },
];

export const layoutChecks = [
  { label: 'No text overflow', ok: true, detail: 'All 12 slides fit at classroom size' },
  { label: 'Fonts embedded', ok: true, detail: 'Inter, JetBrains Mono' },
  { label: 'Code readable at ≥ 16 pt', ok: true, detail: 'Smallest code: 18 pt (slide 8)' },
  { label: '2 slides need review', ok: false, detail: 'Slides 6 and 11 have low contrast diagram labels' },
];

export const exportHistory = [
  { id: 'ex1', course: 'Java OOP Fundamentals', version: 'v3', format: 'Full package', size: '8.1 MB', date: daysAgo(0, 1) },
  { id: 'ex2', course: 'React Hooks Workshop', version: 'v2', format: 'PPTX + PDF', size: '6.4 MB', date: daysAgo(0, 6) },
  { id: 'ex3', course: 'Java OOP Fundamentals', version: 'v2', format: 'PPTX', size: '4.0 MB', date: daysAgo(2) },
  { id: 'ex4', course: 'Python for Data Analysis', version: 'v4', format: 'Full package', size: '9.7 MB', date: daysAgo(2, 4) },
  { id: 'ex5', course: 'REST APIs with Spring Boot 3', version: 'v2', format: 'Code bundle', size: '120 KB', date: daysAgo(3) },
  { id: 'ex6', course: 'Java OOP Fundamentals', version: 'v1', format: 'PDF', size: '2.6 MB', date: daysAgo(9) },
];

/* ---------------- Upgrades ---------------- */

export const upgradePaths = [
  { id: 'react', courseId: 'react-hooks', from: 'React 17', to: 'React 18' },
  { id: 'java', courseId: 'java-streams', from: 'Java 11', to: 'Java 21' },
];

export const upgradeFindings: Record<string, { id: string; severity: 'high' | 'medium' | 'low'; title: string; location: string; detail: string; before: string; after: string }[]> = {
  react: [
    { id: 'r1', severity: 'high', title: 'ReactDOM.render is removed in React 18', location: 'Slide 3 · main.jsx', detail: 'Use createRoot to enable concurrent features.', before: "import ReactDOM from 'react-dom';\n\nReactDOM.render(<App />, document.getElementById('root'));", after: "import { createRoot } from 'react-dom/client';\n\ncreateRoot(document.getElementById('root')).render(<App />);" },
    { id: 'r2', severity: 'medium', title: 'Automatic batching changes update timing', location: 'Example 4 · Counter.jsx', detail: 'setState calls in timeouts are now batched; the demo output changes.', before: "setTimeout(() => {\n  setCount(c => c + 1);\n  setFlag(f => !f); // two renders in React 17\n}, 1000);", after: "setTimeout(() => {\n  setCount(c => c + 1);\n  setFlag(f => !f); // one render in React 18\n}, 1000);" },
    { id: 'r3', severity: 'medium', title: 'Enzyme has no React 18 adapter', location: 'Exercise 2 · tests', detail: 'Migrate tests to React Testing Library.', before: "const wrapper = shallow(<Counter />);\nwrapper.find('button').simulate('click');\nexpect(wrapper.text()).toContain('1');", after: "render(<Counter />);\nawait userEvent.click(screen.getByRole('button'));\nexpect(screen.getByText('1')).toBeInTheDocument();" },
    { id: 'r4', severity: 'low', title: 'useId for accessible ids', location: 'Slide 12 · Form.jsx', detail: 'Optional: replace Math.random() ids with useId().', before: "const id = 'email-' + Math.random();", after: 'const id = useId();' },
  ],
  java: [
    { id: 'j1', severity: 'high', title: 'Use records for value classes', location: 'Slide 5 · Order.java', detail: 'Replace 40 lines of boilerplate with a record (Java 16+).', before: 'public final class Order {\n    private final String id;\n    private final double total;\n    // constructor, getters, equals, hashCode, toString…\n}', after: 'public record Order(String id, double total) {}' },
    { id: 'j2', severity: 'medium', title: 'collect(Collectors.toList()) → toList()', location: 'Slides 7, 9 · Examples 2, 3', detail: 'Stream.toList() (Java 16) returns an unmodifiable list.', before: 'List<String> names = orders.stream()\n    .map(Order::customer)\n    .collect(Collectors.toList());', after: 'List<String> names = orders.stream()\n    .map(Order::customer)\n    .toList();' },
    { id: 'j3', severity: 'medium', title: 'Pattern matching for instanceof', location: 'Slide 11', detail: 'Remove the explicit cast (Java 16).', before: 'if (obj instanceof Order) {\n    Order o = (Order) obj;\n    total += o.total();\n}', after: 'if (obj instanceof Order o) {\n    total += o.total();\n}' },
    { id: 'j4', severity: 'low', title: 'Text blocks for JSON fixtures', location: 'Exercise 3 · tests', detail: 'Multi-line strings without escapes (Java 15).', before: 'String json = "{\\n  \\"id\\": \\"A1\\"\\n}";', after: 'String json = """\n    {\n      "id": "A1"\n    }\n    """;' },
  ],
};

/* ---------------- Coverage ---------------- */

export const syllabi = [
  { id: 'syl-java', name: 'Java Backend Track – Module 1', course: 'java-oop' },
  { id: 'syl-react', name: 'Frontend Track – React Basics', course: 'react-hooks' },
];

export const coverageTopics = [
  { id: 't1', topic: 'Classes and objects', module: 'Foundations', status: 'covered', where: 'Slides 3, Example 1' },
  { id: 't2', topic: 'Constructors and overloading', module: 'Foundations', status: 'covered', where: 'Slide 5' },
  { id: 't3', topic: 'Encapsulation and access modifiers', module: 'Foundations', status: 'covered', where: 'Slide 4, Exercise 1' },
  { id: 't4', topic: 'static members', module: 'Foundations', status: 'missing', where: '—' },
  { id: 't5', topic: 'Inheritance and super', module: 'Reuse', status: 'covered', where: 'Slide 6, Exercise 2' },
  { id: 't6', topic: 'Polymorphism and overriding', module: 'Reuse', status: 'covered', where: 'Slide 8, Example 3' },
  { id: 't7', topic: 'Abstract classes', module: 'Reuse', status: 'partial', where: 'Slide 11 (mentioned)' },
  { id: 't8', topic: 'Interfaces and default methods', module: 'Reuse', status: 'partial', where: 'Slide 9 (no default methods)' },
  { id: 't9', topic: 'Records', module: 'Modern Java', status: 'covered', where: 'Slide 10, Exercise 3' },
  { id: 't10', topic: 'Sealed classes', module: 'Modern Java', status: 'missing', where: '—' },
  { id: 't11', topic: 'equals and hashCode contracts', module: 'Modern Java', status: 'partial', where: 'Quiz Q3' },
  { id: 't12', topic: 'Exceptions in domain logic', module: 'Modern Java', status: 'covered', where: 'Slides 4, 7' },
] as const;

export const objectives = ['Model real entities as classes', 'Protect invariants with encapsulation', 'Reuse behaviour with inheritance', 'Program to interfaces', 'Use records for data'];
// objectives × slides (1-12): 2 = strong, 1 = touches, 0 = none
export const objectiveMatrix = [
  [0, 2, 2, 1, 1, 1, 0, 0, 0, 1, 0, 1],
  [0, 1, 0, 2, 2, 0, 2, 0, 0, 0, 0, 1],
  [0, 1, 0, 0, 0, 2, 0, 2, 0, 0, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 2, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
];

export const gapSuggestions = [
  { id: 'g1', topic: 'static members', suggestion: 'Add a slide "Class vs instance members" with a verified counter example (static int created).', type: 'Slide + example' },
  { id: 'g2', topic: 'Sealed classes', suggestion: 'Add "Sealed hierarchies" slide: sealed interface Account permits Savings, Current, with exhaustive switch.', type: 'Slide + quiz question' },
  { id: 'g3', topic: 'Interfaces and default methods', suggestion: 'Extend slide 9 with a default log() method and one exercise test.', type: 'Slide edit + test' },
  { id: 'g4', topic: 'equals and hashCode contracts', suggestion: 'Add an exercise where a naive equals breaks HashSet behaviour.', type: 'Exercise' },
];

/* ---------------- Resources ---------------- */

export const resourceCategories = ['Code Snippets', 'Exercises', 'PDFs', 'Presentations', 'Diagrams', 'Templates'] as const;
export const resources = [
  { id: 'r1', title: 'BankAccount with validation', category: 'Code Snippets', tags: ['Java', 'OOP'], size: '2 KB', updatedAt: daysAgo(1), verified: true, preview: javaSlides[3].code! },
  { id: 'r2', title: 'useDebounce custom hook', category: 'Code Snippets', tags: ['React', 'Hooks'], size: '1 KB', updatedAt: daysAgo(2), verified: true, preview: "function useDebounce(value, delay = 300) {\n  const [v, setV] = useState(value);\n  useEffect(() => {\n    const t = setTimeout(() => setV(value), delay);\n    return () => clearTimeout(t);\n  }, [value, delay]);\n  return v;\n}" },
  { id: 'r3', title: 'pandas groupby recipes', category: 'Code Snippets', tags: ['Python', 'pandas'], size: '3 KB', updatedAt: daysAgo(5), verified: true, preview: "df.groupby('city')['sales'].agg(['sum', 'mean']).round(2)" },
  { id: 'r4', title: 'Multi-stage Dockerfile', category: 'Code Snippets', tags: ['Docker'], size: '1 KB', updatedAt: daysAgo(3), verified: true, preview: 'FROM node:20-alpine AS build\nWORKDIR /app\nCOPY . .\nRUN npm ci && npm run build\n\nFROM nginx:1.25-alpine\nCOPY --from=build /app/dist /usr/share/nginx/html' },
  { id: 'r5', title: 'Inventory system exercise', category: 'Exercises', tags: ['Java', 'Collections'], size: '12 KB', updatedAt: daysAgo(4), verified: true, preview: '5 JUnit tests · reference + naive solution' },
  { id: 'r6', title: 'Todo app with useReducer', category: 'Exercises', tags: ['React'], size: '9 KB', updatedAt: daysAgo(8), verified: true, preview: '6 Testing Library tests' },
  { id: 'r7', title: 'SQL joins practice set', category: 'Exercises', tags: ['SQL'], size: '7 KB', updatedAt: daysAgo(12), verified: true, preview: '8 queries with expected result sets' },
  { id: 'r8', title: 'Java 21 language guide', category: 'PDFs', tags: ['Java'], size: '1.4 MB', updatedAt: daysAgo(14), verified: false, preview: '38 pages · reference document' },
  { id: 'r9', title: 'Docker cheat sheet', category: 'PDFs', tags: ['Docker'], size: '320 KB', updatedAt: daysAgo(9), verified: true, preview: 'One page · verified commands' },
  { id: 'r10', title: 'Spring Boot 3 kickoff deck', category: 'Presentations', tags: ['Spring', 'Java'], size: '5.1 MB', updatedAt: daysAgo(3), verified: true, preview: '24 slides · speaker notes' },
  { id: 'r11', title: 'Intro to Git (legacy)', category: 'Presentations', tags: ['Git'], size: '3.2 MB', updatedAt: daysAgo(70), verified: false, preview: '18 slides · imported, not verified' },
  { id: 'r12', title: 'Request lifecycle', category: 'Diagrams', tags: ['Spring', 'HTTP'], size: '24 KB', updatedAt: daysAgo(3), verified: true, preview: 'Client → DispatcherServlet → Controller → Service' },
  { id: 'r13', title: 'React render cycle', category: 'Diagrams', tags: ['React'], size: '18 KB', updatedAt: daysAgo(6), verified: true, preview: 'Trigger → Render → Commit' },
  { id: 'r14', title: 'Workshop deck template', category: 'Templates', tags: ['Brand'], size: '880 KB', updatedAt: daysAgo(20), verified: true, preview: 'Title, code, diagram and recap layouts' },
  { id: 'r15', title: 'Exam-prep quiz template', category: 'Templates', tags: ['Quiz'], size: '120 KB', updatedAt: daysAgo(30), verified: true, preview: '10 MCQ layout with explanations' },
];

/* ---------------- Brand kits ---------------- */

export const brandKits = [
  { id: 'bk1', name: 'TechSummit Default', primary: '#4F46E5', secondary: '#7C3AED', accent: '#10B981', heading: 'Inter', body: 'Inter', code: 'JetBrains Mono' },
  { id: 'bk2', name: 'Institute Navy', primary: '#1E3A8A', secondary: '#0EA5E9', accent: '#F97316', heading: 'Inter', body: 'Inter', code: 'JetBrains Mono' },
  { id: 'bk3', name: 'Minimal Mono', primary: '#0F172A', secondary: '#475569', accent: '#22C55E', heading: 'Inter', body: 'Inter', code: 'JetBrains Mono' },
  { id: 'bk4', name: 'Workshop Teal', primary: '#0F766E', secondary: '#14B8A6', accent: '#E11D48', heading: 'Inter', body: 'Inter', code: 'JetBrains Mono' },
];

/* ---------------- Team ---------------- */

export const team = [
  { id: 'u1', name: 'Aarav Mehta', email: 'aarav.mehta@techsummit.edu', role: 'Owner', initials: 'AM', lastActive: daysAgo(0, 0.1), courses: 12 },
  { id: 'u2', name: 'Priya Sharma', email: 'priya.sharma@techsummit.edu', role: 'Editor', initials: 'PS', lastActive: daysAgo(0, 3), courses: 7 },
  { id: 'u3', name: 'Daniel Okafor', email: 'daniel.okafor@techsummit.edu', role: 'Reviewer', initials: 'DO', lastActive: daysAgo(1), courses: 4 },
  { id: 'u4', name: 'Mei Lin', email: 'mei.lin@techsummit.edu', role: 'Editor', initials: 'ML', lastActive: daysAgo(2), courses: 5 },
  { id: 'u5', name: 'Rohan Gupta', email: 'rohan.gupta@techsummit.edu', role: 'Reviewer', initials: 'RG', lastActive: daysAgo(6), courses: 2 },
];

export const comments = [
  { id: 'c1', author: 'Priya Sharma', initials: 'PS', course: 'REST APIs with Spring Boot 3', target: 'Slide 7', text: 'Can we show the 404 response body here too? Students always ask.', at: daysAgo(1, 8), resolved: false },
  { id: 'c2', author: 'Daniel Okafor', initials: 'DO', course: 'Java OOP Fundamentals', target: 'Exercise 1', text: 'Naive solution is great. Maybe add a hint about the exact-balance edge case.', at: daysAgo(0, 5), resolved: false },
  { id: 'c3', author: 'Mei Lin', initials: 'ML', course: 'React Hooks Workshop', target: 'Slide 12', text: 'Updated to useId after the React 18 upgrade. Re-verified.', at: daysAgo(2), resolved: true },
];

export const teamActivity = [
  { id: 1, who: 'Priya Sharma', what: 'commented on Slide 7 of REST APIs with Spring Boot 3', at: daysAgo(1, 8) },
  { id: 2, who: 'Mei Lin', what: 'accepted 4 upgrade changes in React Hooks Workshop', at: daysAgo(2) },
  { id: 3, who: 'Daniel Okafor', what: 'approved Java OOP Fundamentals v3', at: daysAgo(0, 5) },
  { id: 4, who: 'Aarav Mehta', what: 'invited rohan.gupta@techsummit.edu as Reviewer', at: daysAgo(6) },
];

/* ---------------- Help ---------------- */

export const setupGuides = [
  { title: 'Create your first course', desc: 'Topic to verified deck in under 5 minutes.', time: '4 min', href: '/courses/new' },
  { title: 'Set up your Brand Kit', desc: 'Logo, colours and fonts for every export.', time: '3 min', href: '/brand-kit' },
  { title: 'Understand verification', desc: 'How snippets are run, compared and auto-fixed.', time: '6 min', href: '/verification' },
  { title: 'Upgrade an old course', desc: 'Move a deck to a newer framework safely.', time: '5 min', href: '/upgrades' },
];

export const faqs = [
  { q: 'How is code verified?', a: 'Every snippet in slides, notes, examples and exercises is extracted and executed in an isolated container with the pinned runtime (for example eclipse-temurin:21.0.2). Output is compared with the expected output shown to students, and exercise tests run against a reference solution and a deliberately naive one.' },
  { q: 'What happens when a snippet fails?', a: 'The failure log is sent back to the generator, which proposes a fix. The fix is re-run; up to three attempts are made. Every attempt is recorded in the verification report.' },
  { q: 'Can I pin exact versions?', a: 'Yes. Choose the language and framework version when creating a course, or set defaults in Settings → Preferences. Reports list the exact runtime and dependency versions used.' },
  { q: 'Does the sandbox have internet access?', a: 'No. Containers run without network access, with CPU, memory and a 5-second timeout per snippet.' },
  { q: 'Which export formats are supported?', a: 'PowerPoint (with speaker notes), PDF, trainer notes, a runnable code bundle, exercises with tests, quiz and a one-page cheat sheet, individually or as a full package.' },
];

export const commonErrors = [
  { error: 'Output mismatch', cause: 'The snippet prints something different from the expected output on the slide (often extra logging or float formatting).', fix: 'Regenerate the slide, or edit the expected output if the new output is correct.' },
  { error: 'Compilation failed: cannot find symbol', cause: 'The slide shows a fragment that depends on a class defined elsewhere.', fix: 'Add the class to the hidden setup or mark the snippet as compile-with-context.' },
  { error: 'Timeout after 5s', cause: 'Infinite loop, blocking input, or a server started in an example.', fix: 'Remove Scanner input or server start-up; use MockMvc or a test client instead.' },
  { error: 'Naive solution passes all tests', cause: 'The exercise tests do not cover the edge case the naive solution gets wrong.', fix: 'Use "Regenerate tests"; the generator adds a test that fails on the naive solution.' },
  { error: 'Deprecated API warning', cause: 'Code uses an API deprecated in the pinned version (for example ReactDOM.render in React 18).', fix: 'Run Version Upgrades to migrate and re-verify the affected examples.' },
];
