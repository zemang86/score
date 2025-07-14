import WaitlistComponent from "@/components/ui/waiting-list";

export default function DemoOne() {
  return <WaitlistComponent
    title="Join Our Beta Program"
    subtitle="Our platform is currently in beta and only accessible to approved testers. Be the first to know when we launch something amazing!"
    placeholder="Enter your email address"
    buttonText={{
      idle: "Join Beta Waitlist",
      loading: "Joining...",
      success: "Welcome to the waitlist!",
    }}
    theme="system"
  />
}