from ui.pages.objects.pageObjects import *


class VSEntryDataPage(BasicPage):
    def __init__(self):
        super().__init__("Sistema de Visão: Entrada de dados", QIcon("src/assets/USB.png"))

        
        # Adicionando um texto e botão como exemplo
        self.add_widget(QLabel("Bem-vindo ao simulador!"))

        btn = QPushButton("Iniciar simulação")
        self.add_widget(btn)