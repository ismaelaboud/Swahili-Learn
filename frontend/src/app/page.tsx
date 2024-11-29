import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Swahilipot Learn
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            A modern platform for online education
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature Cards */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-xl font-semibold text-card-foreground">Interactive Learning</h3>
            <p className="mt-2 text-muted-foreground">
              Engage with interactive content and real-time feedback
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-xl font-semibold text-card-foreground">Expert Instructors</h3>
            <p className="mt-2 text-muted-foreground">
              Learn from industry professionals and experienced educators
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-xl font-semibold text-card-foreground">Flexible Learning</h3>
            <p className="mt-2 text-muted-foreground">
              Study at your own pace with our flexible course structure
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
