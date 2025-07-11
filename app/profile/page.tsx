"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useAsync } from "@/hooks/use-async"
import { useNotifications } from "@/lib/stores/notification-store"
import { getFriendlyErrorMessage } from "@/lib/errors"

export default function ProfilePage() {
  const { user, userRole, isLoading, refreshUserRole, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const { notifySuccess } = useNotifications()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [savedSearches, setSavedSearches] = useState<any[]>([])
  const [isLoadingSearches, setIsLoadingSearches] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    } else if (user) {
      setEmail(user.email || "")
      setName(user.user_metadata?.name || "")
      loadSavedSearches()
    }
  }, [isLoading, user, router])

  const loadSavedSearches = async () => {
    if (!user) return

    setIsLoadingSearches(true)
    try {
      // En una implementación real, cargaríamos las búsquedas guardadas desde Supabase
      // Por ahora, usamos datos de ejemplo
      setSavedSearches([
        { id: 1, type: "vehicle", name: "Toyota Corolla 2020", date: "2023-05-15" },
        { id: 2, type: "financing", name: "Préstamo BAC 8.5%", date: "2023-05-10" },
      ])
    } catch (error) {
      console.error("Error loading saved searches:", error)
    } finally {
      setIsLoadingSearches(false)
    }
  }

  const updateProfileAsync = async (newName: string) => {
    if (!user) throw new Error("Usuario no autenticado.")

    const { error } = await supabase.auth.updateUser({
      data: { name: newName },
    })

    if (error) throw error
    return { success: true }
  }

  const {
    execute: executeUpdateProfile,
    isLoading: isUpdating,
    error: updateErrorStatus, // Renamed to avoid conflict if you keep local error display
  } = useAsync(updateProfileAsync, {
    onSuccess: () => {
      setUpdateSuccess(true)
      notifySuccess("Perfil Actualizado", "Tu nombre ha sido actualizado correctamente.")
    },
    customErrorMessage: (err) => {
      if (err.message.includes("User not found")) {
        // Example of more specific handling
        return "No se pudo actualizar el perfil porque el usuario no fue encontrado."
      }
      // For other errors, let getFriendlyErrorMessage handle it or provide another custom one
      return `Error al actualizar el perfil. Inténtalo de nuevo.`
    },
  })

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateSuccess(false)
    await executeUpdateProfile(name)
  }

  const handleDeleteSearch = async (id: number) => {
    // En una implementación real, eliminaríamos la búsqueda de Supabase
    setSavedSearches(savedSearches.filter((search) => search.id !== id))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center">
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Mi Perfil</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="profile">Información Personal</TabsTrigger>
          <TabsTrigger value="searches">Búsquedas Guardadas</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-soft-md">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tu información personal y preferencias.</CardDescription>
            </CardHeader>
            <form onSubmit={handleFormSubmit}>
              <CardContent className="space-y-4">
                {updateSuccess && (
                  <Alert>
                    <AlertDescription>Perfil actualizado correctamente.</AlertDescription>
                  </Alert>
                )}

                {updateErrorStatus && !isUpdating && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{getFriendlyErrorMessage(updateErrorStatus)}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" value={email} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isUpdating} />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de cuenta</Label>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-muted rounded-full text-sm">
                      {userRole === "admin"
                        ? "Administrador"
                        : userRole === "paid_user"
                          ? "Usuario Premium"
                          : "Usuario Gratuito"}
                    </div>
                    {userRole === "free_user" && (
                      <Button variant="outline" size="sm" className="shadow-soft-sm shadow-soft-hover">
                        Actualizar a Premium
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/")}
                  className="shadow-soft-sm shadow-soft-hover"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUpdating} className="shadow-soft-sm shadow-soft-hover">
                  {isUpdating ? "Actualizando..." : "Guardar Cambios"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="searches">
          <Card className="shadow-soft-md">
            <CardHeader>
              <CardTitle>Búsquedas Guardadas</CardTitle>
              <CardDescription>Accede rápidamente a tus búsquedas y comparaciones guardadas.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSearches ? (
                <p className="text-center py-4 text-muted-foreground">Cargando búsquedas...</p>
              ) : savedSearches.length > 0 ? (
                <div className="space-y-3">
                  {savedSearches.map((search) => (
                    <div
                      key={search.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{search.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {search.type === "vehicle" ? "Vehículo" : "Financiamiento"} •
                          {new Date(search.date).toLocaleDateString("es-CR")}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="shadow-soft-sm shadow-soft-hover">
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive shadow-soft-sm shadow-soft-hover"
                          onClick={() => handleDeleteSearch(search.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No tienes búsquedas guardadas.</p>
                  <Button onClick={() => router.push("/car-ranking")} className="shadow-soft-sm shadow-soft-hover">
                    Explorar Vehículos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
