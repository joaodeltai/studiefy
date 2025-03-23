"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/toaster"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BookOpen, Calendar, User, Settings, Home, PlusCircle, Bell, Search, Save, Trash, Eye, Loader2, Info, HelpCircle, X, ChevronDown, SlidersHorizontal } from "lucide-react"
import ComponentsExtras from "./components-extras"
import AvatarSection from "./components/avatar-section"
import ButtonSection from "./components/button-section"
import BadgeSection from "./components/badge-section"
import CardSection from "./components/card-section"
import TableSection from "./components/table-section"
import IconSection from "./components/icon-section"
import TextfieldSection from "./components/textfield-section"
import ToggleSection from "./components/toggle-section"
import RadioSection from "./components/radio-section"
import LoadingSection from "./components/loading-section"
import ModalSection from "./components/modal-section"
import TooltipSection from "./components/tooltip-section"
import SearchSection from "./components/search-section"
import CheckboxSection from "./components/checkbox-section"
import NavigationSection from "./components/navigation-section"
import TabsSection from "./components/tabs-section"
import ToastSection from "./components/toast-section"
import BannerSection from "./components/banner-section"
import DropdownSection from "./components/dropdown-section"

export default function DesignSystemPage() {
  return (
    <div className="container mx-auto py-10">
      
      <h1 className="text-3xl font-bold mb-6">Sistema de Design</h1>
      <div className="flex justify-between items-center mb-8">
        <p className="text-muted-foreground">
          Esta página contém todos os componentes e padrões de design utilizados no Studiefy.
          Use esta referência para manter a consistência visual em todo o aplicativo.
        </p>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-4">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Opções
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Visualização</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>
              <span>Mostrar exemplos</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>
              <span>Mostrar boas práticas</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Tema</DropdownMenuLabel>
            <DropdownMenuRadioGroup value="light">
              <DropdownMenuRadioItem value="light">
                <span>Claro</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <span>Escuro</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <span>Sistema</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AvatarSection />

        <ButtonSection />

        <BadgeSection />

        <CardSection />

        <TableSection />

        <IconSection />

        <TextfieldSection />

        <ToggleSection />

        <RadioSection />

        <LoadingSection />

        <ModalSection />

        <TooltipSection />

        <SearchSection />

        <CheckboxSection />

        <NavigationSection />
        
        <TabsSection />
        
        <ToastSection />
        
        <BannerSection />
        
        <DropdownSection />
      </Accordion>
      
      <ComponentsExtras />
      
      <Toaster />
    </div>
  )
}
