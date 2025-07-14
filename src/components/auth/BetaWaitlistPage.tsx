import WaitlistComponent from "../ui/waiting-list";

export default function BetaWaitlistPage() {
  return <WaitlistComponent
         title="Join our waitlist"
         subtitle="Be the first to know when we launch something amazing"
         placeholder="Enter your email address"
         buttonText={{
           idle: "Join Waitlist",
           loading: "Joining...",
           success: "Welcome aboard!",
         }}
         theme="system"
  />
}