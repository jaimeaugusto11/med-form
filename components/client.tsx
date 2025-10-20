"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

interface Colaborador {
  cr557_npessoal: string;
  cr557_nomecompleto: string;
}

export default function Home() {
  const searchParams = useSearchParams();
  const mecnumber = searchParams.get("mecnumber");
  const tipoexame = searchParams.get("tipoexame");
  const dataexame = searchParams.get("dataexame");
  const horario = searchParams.get("horario");
  const local = searchParams.get("local");

  const [isAvailable, setIsAvailable] = useState(true);
  const [descricao, setDescricao] = useState("");
  const [dataAlternativa, setDataAlternativa] = useState("");
  const [horarioAlternativo, setHorarioAlternativo] = useState("");
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchColaborador() {
      if (!mecnumber) {
        setError("Use o link fornecido por email");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          "https://prod-48.westeurope.logic.azure.com:443/workflows/df17619d6a844205a00d3fc2b295d225/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6KGuc73wpNBxJEaFzEX3K71K3uabqoiZmrskrQ9sumE",
          { method: "GET" }
        );
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const payload = await res.json();

        let list: Colaborador[] = [];
        if (Array.isArray(payload)) {
          list = payload;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } else if (Array.isArray((payload as any).value)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          list = (payload as any).value;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } else if (Array.isArray((payload as any).colaboradores)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          list = (payload as any).colaboradores;
        }

        const filtered = list.filter((col) => col.cr557_npessoal === mecnumber);
        if (filtered.length > 0) {
          setColaborador(filtered[0]);
        } else {
          setError("Colaborador não encontrado.");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Erro ao carregar colaborador");
      } finally {
        setLoading(false);
      }
    }
    fetchColaborador();
  }, [mecnumber]);

  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-1 pb-20 gap-16 sm:p-20">
      <main className="w-full max-w-xl">
        <Image
          src="/logo.webp"
          alt="Logo"
          height={80}
          width={80}
          className="pb-10"
        />

        {loading && <p>Carregando colaborador...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && colaborador && (
          <p className="mb-4 text-sm text-gray-700">
            Pedido de comparença para{" "}
            <strong>{colaborador.cr557_nomecompleto}</strong> (Nº Mecanográfico:{" "}
            <strong>{colaborador.cr557_npessoal}</strong>)
          </p>
        )}

        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();

            const payload = {
              tipoexame: tipoexame || "Não especificado",
              dataexame: dataexame || new Date().toISOString().split("T")[0],
              horario: horario || "Não definido",
              local: local || "Não definido",
              obs: isAvailable ? "" : descricao,
              mec: mecnumber || "",
              resposta: isAvailable ? "Aceito" : "Recusado",
              data_alternativa: isAvailable ? "" : dataAlternativa,
              horario_alternativo: isAvailable ? "" : horarioAlternativo,
            };

            try {
              const response = await fetch(
                "https://prod-235.westeurope.logic.azure.com:443/workflows/67501fda924d4afbb4c35ac4e2277175/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2EghKNeMNIDzpKAth_WOLjUD_U_m0a1DQj0jmyJQ3MA",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(payload),
                }
              );

              if (response.ok) {
                alert("Resposta enviada com sucesso!");
                setIsAvailable(true);
                setDescricao("");
                setDataAlternativa("");
                setHorarioAlternativo("");
              } else {
                alert("Erro ao enviar. Tente novamente.");
              }
            } catch (error) {
              console.error(error);
              alert("Erro ao enviar. Verifique sua conexão.");
            }
          }}
        >
          <div className="sm:col-span-4">
            <label
              htmlFor="colaborador"
              className="block text-sm font-medium text-gray-900"
            >
              Colaborador
            </label>
            <div className="mt-2 flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300 focus-within:outline-2">
              <span className="text-gray-500 select-none">zap.ao/</span>
              <input
                id="colaborador"
                name="colaborador"
                type="text"
                defaultValue={colaborador?.cr557_nomecompleto}
                readOnly
                className="flex-1 py-1.5 pl-1 text-base focus:outline-none"
              />
            </div>
          </div>

          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold text-gray-900">
              Pedido de comparença aos exames de Medicina Ocupacional
            </h2>

            <div className="mt-6 space-y-6">
              <label className="flex items-center gap-x-3">
                <input
                  type="radio"
                  name="availability"
                  checked={isAvailable}
                  onChange={() => setIsAvailable(true)}
                  className="form-radio"
                />
                <span>Aceito</span>
              </label>

              <label className="flex items-center gap-x-3">
                <input
                  type="radio"
                  name="availability"
                  checked={!isAvailable}
                  onChange={() => setIsAvailable(false)}
                  className="form-radio"
                />
                <span>Não estarei disponível</span>
              </label>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out mt-6 ${
                isAvailable ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
              }`}
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                  <label
                    htmlFor="descricao"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    rows={3}
                    className="mt-2 w-full rounded-sm bg-white px-3 py-1.5 text-base outline-1 outline-gray-300 focus:outline-2 placeholder-gray-400"
                    placeholder="Motivo da indisponibilidade(Férias, Baixa médica, outro)"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                </div>

                <div className="col-span-full sm:col-span-3">
                  <label
                    htmlFor="data-alternativa"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Data disponível
                  </label>
                  <input
                    type="date"
                    id="data-alternativa"
                    name="data-alternativa"
                    className="mt-2 block w-full rounded-sm bg-white px-3 py-2 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
                    value={dataAlternativa}
                    onChange={(e) => setDataAlternativa(e.target.value)}
                  />
                </div>

                <div className="col-span-full sm:col-span-3">
                  <label
                    htmlFor="horario-alternativo"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Horário disponível
                  </label>
                  <select
                    id="horario-alternativo"
                    name="horario-alternativo"
                    className="mt-2 block w-full rounded-sm bg-white px-3 py-2 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
                    value={horarioAlternativo}
                    onChange={(e) => setHorarioAlternativo(e.target.value)}
                  >
                    <option value="">Seleccione um horário</option>
                    {[
                      "08H00",
                      "08H30",
                      "09H00",
                      "09H30",
                      "10H00",
                      "10H30",
                      "11H00",
                      "11H30",
                      "12H00",
                      "12H30",
                      "13H00",
                      "13H30",
                      "14H00",
                      "14H30",
                      "15H00",
                      "15H30",
                      "16H00",
                      "16H30",
                      "17H00",
                      "17H30",
                    ].map((hora) => (
                      <option key={hora} value={hora}>
                        {hora}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-x-6">
            <button
              type="button"
              className="text-sm font-semibold text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none"
            >
              Responder
            </button>
          </div>
        </form>
      </main>

      <footer className="w-full max-w-xl mx-auto flex items-center justify-center gap-3 text-center text-xs text-gray-500 py-4">
        <Image src="/zap.svg" alt="Logo" height={60} width={60} />
        <span>
          &copy; {new Date().getFullYear()} ZAP. Todos os direitos reservados.
        </span>
      </footer>
    </div>
  );
}
