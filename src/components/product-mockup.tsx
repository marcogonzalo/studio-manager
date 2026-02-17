"use client";

import { motion } from "framer-motion";
import {
  FolderKanban,
  Users,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

export function ProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      {/* Glow background */}
      <div className="from-primary/20 via-primary/5 absolute -inset-4 rounded-3xl bg-gradient-to-br to-transparent blur-2xl" />

      {/* Main mockup card */}
      <motion.div
        className="bg-card border-border relative overflow-hidden rounded-2xl border shadow-2xl"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {/* Fake title bar */}
        <div className="bg-muted/50 border-border flex items-center gap-2 border-b px-4 py-3">
          <div className="flex gap-1.5">
            <div className="bg-destructive/60 h-3 w-3 rounded-full" />
            <div className="bg-chart-5/60 h-3 w-3 rounded-full" />
            <div className="bg-primary/60 h-3 w-3 rounded-full" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-muted-foreground text-xs font-medium">
              Veta — Dashboard
            </span>
          </div>
        </div>

        {/* Fake dashboard content */}
        <div className="space-y-4 p-4">
          {/* Stat cards row */}
          <div className="grid grid-cols-3 gap-3">
            <MockStatCard
              icon={FolderKanban}
              label="Proyectos"
              value="12"
              trend="+3"
              color="text-primary"
              bgColor="bg-primary/10"
              delay={0.5}
            />
            <MockStatCard
              icon={Users}
              label="Clientes"
              value="28"
              trend="+5"
              color="text-chart-2"
              bgColor="bg-chart-2/10"
              delay={0.7}
            />
            <MockStatCard
              icon={TrendingUp}
              label="Ingresos"
              value="€84k"
              trend="+12%"
              color="text-chart-4"
              bgColor="bg-chart-4/10"
              delay={0.9}
            />
          </div>

          {/* Fake project list */}
          <div className="space-y-2">
            <p className="text-muted-foreground px-1 text-xs font-medium">
              Proyectos Recientes
            </p>
            <MockProjectRow
              name="Reforma Ático Salamanca"
              client="María García"
              status="Obra y ejecución"
              delay={1.1}
            />
            <MockProjectRow
              name="Hotel Boutique Malasaña"
              client="Grupo Hostelero BCN"
              status="Diseño ejecutivo"
              delay={1.3}
            />
            <MockProjectRow
              name="Oficinas Coworking"
              client="TechSpace S.L."
              status="Obra y ejecución"
              delay={1.5}
            />
          </div>
        </div>
      </motion.div>

      {/* Floating notification badge */}
      <motion.div
        className="bg-primary text-primary-foreground shadow-primary/25 absolute -top-3 -right-3 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg"
        initial={{ opacity: 0, scale: 0, rotate: -12 }}
        animate={{ opacity: 1, scale: 1, rotate: -6 }}
        transition={{
          duration: 0.5,
          delay: 1.8,
          type: "spring",
          stiffness: 200,
        }}
      >
        3 nuevos proyectos
      </motion.div>

      {/* Floating catalog card */}
      <motion.div
        className="bg-card border-border absolute -bottom-4 -left-4 flex items-center gap-2 rounded-xl border p-3 shadow-lg"
        initial={{ opacity: 0, x: -20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 2.0, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <div className="bg-chart-5/10 text-chart-5 rounded-lg p-1.5">
          <ShoppingBag className="h-4 w-4" />
        </div>
        <div>
          <p className="text-foreground text-xs font-medium">Catálogo</p>
          <p className="text-muted-foreground text-[10px]">248 productos</p>
        </div>
      </motion.div>
    </div>
  );
}

function MockStatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
  bgColor,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend: string;
  color: string;
  bgColor: string;
  delay: number;
}) {
  return (
    <motion.div
      className="bg-background border-border/50 rounded-xl border p-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div
        className={`${bgColor} ${color} mb-2 flex h-6 w-6 items-center justify-center rounded-md`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-foreground text-sm font-bold">{value}</p>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-[10px]">{label}</p>
        <span className="text-primary text-[10px] font-medium">{trend}</span>
      </div>
    </motion.div>
  );
}

function MockProjectRow({
  name,
  client,
  status,
  delay,
}: {
  name: string;
  client: string;
  status: string;
  delay: number;
}) {
  return (
    <motion.div
      className="bg-background border-border/50 hover:bg-accent/5 flex items-center justify-between rounded-lg border p-2.5 transition-colors"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="bg-primary/10 text-primary flex-shrink-0 rounded-md p-1.5">
          <FolderKanban className="h-3 w-3" />
        </div>
        <div className="min-w-0">
          <p className="text-foreground truncate text-xs font-medium">{name}</p>
          <p className="text-muted-foreground truncate text-[10px]">{client}</p>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium">
          {status}
        </span>
        <ArrowRight className="text-muted-foreground h-3 w-3" />
      </div>
    </motion.div>
  );
}
