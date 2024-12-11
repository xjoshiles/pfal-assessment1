import SetForm from "@/components/SetForm"
import { getCurrentUser } from "@/lib/session"
import { canCreateSet } from "@/lib/api"

export default async function CreateSet() {
  const user = await getCurrentUser()
  const canCreate = user.admin ? true : await canCreateSet()

  return (
    <section>
      <div className="min-h-screen">
        <h1 className="title title-background">
          Create a Flashcard Set
        </h1>
        <div className="section_container">
          {canCreate ? (
            <SetForm />
          ) : (
            <div className="form-error-text mt-8">
              Daily set creation limit reached, please try again tomorrow
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
